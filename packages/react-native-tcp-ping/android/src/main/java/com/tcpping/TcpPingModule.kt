package com.tcpping

import android.os.SystemClock
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.tcpping.protection.TcpPingProtectionRegistry
import java.net.InetSocketAddress
import java.net.Socket
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.RejectedExecutionHandler
import java.util.concurrent.ThreadFactory
import java.util.concurrent.ThreadPoolExecutor
import java.util.concurrent.TimeUnit
import java.util.concurrent.Future
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.roundToInt

@ReactModule(name = TcpPingModule.NAME)
open class TcpPingModule internal constructor(context: ReactApplicationContext) : NativeTcpPingSpec(context) {
  override fun getName(): String = NAME

  private val workerExecutor: ThreadPoolExecutor =
    ThreadPoolExecutor(
      CORE_POOL_SIZE,
      MAX_POOL_SIZE,
      KEEP_ALIVE_SECONDS,
      TimeUnit.SECONDS,
      LinkedBlockingQueue<Runnable>(RUN_QUEUE_CAPACITY),
      TcpPingThreadFactory(),
      RejectedExecutionHandler { runnable, _ ->
        // 拒绝时退化到当前线程执行，确保任务不会丢失
        runnable.run()
      },
    ).apply {
      allowCoreThreadTimeOut(true)
    }
  private val requestStates = ConcurrentHashMap<String, BatchRequestState>()

  @ReactMethod
  override fun startPing(host: String, port: Double, count: Double, bypassVpn: Boolean?, promise: Promise) {
    workerExecutor.execute {
      try {
        val timesInt = count.toInt().coerceAtLeast(1)
        val p = port.toInt()
        val result =
          performSinglePing(host, p, timesInt, DEFAULT_TIMEOUT_MS, null, bypassVpn ?: DEFAULT_BYPASS_VPN)
        promise.resolve(result?.avgTime)
      } catch (e: Exception) {
        promise.resolve(null)
      }
    }
  }

  @ReactMethod
  override fun startBatchPing(requestId: String, targets: ReadableArray, options: ReadableMap?) {
    val total = targets.size()
    val defaultCount = options?.takeIf { it.hasKey("count") }?.getDouble("count")?.toInt() ?: DEFAULT_COUNT
    val defaultTimeout = options?.takeIf { it.hasKey("timeoutMs") }?.getDouble("timeoutMs")?.toInt() ?: DEFAULT_TIMEOUT_MS

    if (total <= 0) {
      emitCompletion(requestId, cancelled = false)
      return
    }

    requestStates.put(requestId, BatchRequestState(total)).also { previous ->
      if (previous != null) {
        cancelState(requestId, previous, true)
      }
    }

    val state = requestStates[requestId] ?: return

    for (i in 0 until total) {
      val job = buildJob(targets, i, defaultCount, defaultTimeout)
      val future = workerExecutor.submit {
        if (state.cancelled.get()) {
          return@submit
        }

        val computation = when {
          job.error != null -> PingComputation(job.host, job.port, 0, 0, null, job.error)
          job.host == null || job.port == null ->
            PingComputation(job.host, job.port, 0, 0, null, "invalid_target")
          else -> performSinglePing(job.host, job.port, job.count, job.timeoutMs, state, job.bypassVpn)
        }

        if (computation == null) {
          return@submit
        }

        if (state.cancelled.get()) {
          return@submit
        }

        val done = state.remaining.decrementAndGet() == 0
        emitResult(requestId, computation, done, state.cancelled.get())
        if (done) {
          requestStates.remove(requestId)
        }
      }
      state.futures.add(future)
    }
  }

  @ReactMethod
  override fun stopBatchPing(requestId: String) {
    val state = requestStates.remove(requestId) ?: return
    cancelState(requestId, state, true)
  }

  @ReactMethod
  override fun addListener(eventName: String) {
    // 必须存在以兼容 RN 事件机制，实际无需处理
  }

  @ReactMethod
  override fun removeListeners(count: Double) {
    // 必须存在以兼容 RN 事件机制，实际无需处理
  }

  private fun performSinglePing(
    host: String,
    port: Int,
    count: Int,
    timeoutMs: Int,
    state: BatchRequestState? = null,
    bypassVpn: Boolean,
  ): PingComputation? {
    val attemptTarget = max(count, MIN_EFFECTIVE_ATTEMPTS)
    val results = ArrayList<Int>(attemptTarget)
    var suspiciousCount = 0

    repeat(attemptTarget) {
      if (state?.cancelled?.get() == true || Thread.currentThread().isInterrupted) {
        return null
      }
      val t = tcpOnce(host, port, timeoutMs, bypassVpn)
      if (t >= 0) {
        val timeMs = t.toInt()
        if (timeMs < SUSPICIOUS_THRESHOLD_MS) {
          suspiciousCount += 1
        }
        results.add(timeMs)
      }
    }

    if (results.isEmpty()) {
      val err = if (suspiciousCount > 0) "too_fast" else null
      return PingComputation(host, port, 0, attemptTarget, null, err)
    }

    val sorted = results.sorted()
    val trimmed =
      if (sorted.size >= TRIM_LOWER_BOUND_COUNT && sorted.first() != sorted.last()) sorted.drop(1) else sorted
    val average = trimmed.average()
    var avgInt = average.roundToInt()
    if (avgInt < 0) {
      avgInt = 0
    }
    if (BuildConfig.DEBUG) {
      Log.d(NAME, "result $avgInt ms (bypassVpn=$bypassVpn) for $host:$port, suspicious=$suspiciousCount")
    }
    return PingComputation(host, port, results.size, attemptTarget, avgInt, null)
  }

  private fun buildJob(
    array: ReadableArray,
    index: Int,
    defaultCount: Int,
    defaultTimeout: Int,
  ): PingJob {
    val item = array.getMap(index)
    if (item == null) {
      return PingJob(null, null, defaultCount, defaultTimeout, DEFAULT_BYPASS_VPN, "invalid_target")
    }

    val host = when {
      item.hasKey("host") -> item.getString("host")
      item.hasKey("ip") -> item.getString("ip")
      else -> null
    }
    val port = if (item.hasKey("port")) item.getDouble("port").toInt() else null
    val count = if (item.hasKey("count")) item.getDouble("count").toInt() else defaultCount
    val timeout = if (item.hasKey("timeoutMs")) item.getDouble("timeoutMs").toInt() else defaultTimeout
    val bypassVpn = if (item.hasKey("bypassVpn")) item.getBoolean("bypassVpn") else DEFAULT_BYPASS_VPN

    if (host.isNullOrEmpty() || port == null) {
      return PingJob(
        host,
        port,
        count.coerceAtLeast(1),
        timeout.coerceAtLeast(100),
        bypassVpn,
        "invalid_target",
      )
    }

    return PingJob(
      host,
      port,
      count.coerceAtLeast(1),
      timeout.coerceAtLeast(100),
      bypassVpn,
      null,
    )
  }

  private fun cancelState(requestId: String, state: BatchRequestState, emitEvent: Boolean) {
    if (!state.cancelled.getAndSet(true)) {
      state.futures.forEach { it.cancel(true) }
      if (emitEvent) {
        emitCompletion(requestId, cancelled = true)
      }
    }
  }

  private fun emitResult(requestId: String, result: PingComputation, done: Boolean, cancelled: Boolean) {
    val map = Arguments.createMap()
    map.putString("requestId", requestId)
    if (result.host != null) {
      map.putString("host", result.host)
    } else {
      map.putNull("host")
    }
    if (result.port != null) {
      map.putInt("port", result.port)
    } else {
      map.putNull("port")
    }
    map.putInt("totalCount", result.totalCount)
    map.putInt("successCount", result.successCount)
    if (result.avgTime != null) {
      map.putInt("avgTime", result.avgTime)
    } else {
      map.putNull("avgTime")
    }
    map.putBoolean("success", result.successCount > 0 && result.error == null)
    map.putBoolean("done", done)
    map.putBoolean("cancelled", cancelled)
    result.error?.let { map.putString("error", it) }
    sendEvent(map)
  }

  private fun emitCompletion(requestId: String, cancelled: Boolean) {
    val map = Arguments.createMap()
    map.putString("requestId", requestId)
    map.putNull("host")
    map.putNull("port")
    map.putInt("totalCount", 0)
    map.putInt("successCount", 0)
    map.putNull("avgTime")
    map.putBoolean("success", false)
    map.putBoolean("done", true)
    map.putBoolean("cancelled", cancelled)
    sendEvent(map)
  }

  private fun sendEvent(map: WritableMap) {
    reactApplicationContext
      .getJSModule(RCTDeviceEventEmitter::class.java)
      .emit(EVENT_BATCH_RESULT, map)
  }

  private fun tcpOnce(host: String, port: Int, timeoutMs: Int, bypassVpn: Boolean): Long {
    var socket: Socket? = null
    return try {
      socket = Socket()
      if (bypassVpn) {
        val vpnActive = TcpPingProtectionRegistry.isVpnLikelyActive()
        if (vpnActive) {
          val protection = TcpPingProtectionRegistry.protectSocket(socket)
          if (protection != true) {
            Log.w(NAME, "tcp ping socket未被VPN服务保护，丢弃本次测速")
            return -1
          }
        }
        if (BuildConfig.DEBUG) {
          Log.d(NAME, "tcpOnce bypassVpn true protect success for $host:$port")
        }
      } else if (BuildConfig.DEBUG) {
        Log.d(NAME, "tcpOnce bypassVpn false for $host:$port")
      }
      val start = SystemClock.elapsedRealtimeNanos()
      socket.connect(InetSocketAddress(host, port), timeoutMs)
      val end = SystemClock.elapsedRealtimeNanos()
      val elapsedMs = (end - start) / 1_000_000.0
      ceil(elapsedMs).toLong()
    } catch (_: Exception) {
      -1
    } finally {
      try {
        socket?.close()
      } catch (_: Exception) {
      }
    }
  }

  private class BatchRequestState(total: Int) {
    val remaining = AtomicInteger(total)
    val cancelled = AtomicBoolean(false)
    val futures = CopyOnWriteArrayList<Future<*>>()
  }

  private data class PingJob(
    val host: String?,
    val port: Int?,
    val count: Int,
    val timeoutMs: Int,
    val bypassVpn: Boolean,
    val error: String?,
  )

  private data class PingComputation(
    val host: String?,
    val port: Int?,
    val successCount: Int,
    val totalCount: Int,
    val avgTime: Int?,
    val error: String?,
  )

  private class TcpPingThreadFactory : ThreadFactory {
    private val index = AtomicInteger(0)

    override fun newThread(runnable: Runnable): Thread {
      return Thread(runnable, "TcpPingWorker-${index.incrementAndGet()}").apply {
        isDaemon = true
      }
    }
  }

  companion object {
    const val NAME = "TcpPing"
    private const val CORE_POOL_SIZE = 2
    private const val MAX_POOL_SIZE = 6
    private const val RUN_QUEUE_CAPACITY = 32
    private const val KEEP_ALIVE_SECONDS = 30L
    private const val EVENT_BATCH_RESULT = "TcpPingBatchResult"
    private const val DEFAULT_COUNT = 4
    private const val DEFAULT_TIMEOUT_MS = 3000
    private const val MIN_VALID_LATENCY_MS = 10
    private const val MIN_EFFECTIVE_ATTEMPTS = 3
    private const val MIN_EFFECTIVE_RESULT_COUNT = 2
    private const val SUSPICIOUS_THRESHOLD_MS = 8
    private const val TRIM_LOWER_BOUND_COUNT = 3
    private const val DEFAULT_BYPASS_VPN = true
  }
}
