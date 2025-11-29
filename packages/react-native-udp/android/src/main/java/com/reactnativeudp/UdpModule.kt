package com.reactnativeudp

import android.util.Base64
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.SocketException
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import java.util.concurrent.Future
import java.util.concurrent.atomic.AtomicBoolean

@ReactModule(name = UdpModule.NAME)
class UdpModule internal constructor(context: ReactApplicationContext) : NativeUdpSpec(context) {
  override fun getName(): String = NAME

  private val executor: ExecutorService = Executors.newCachedThreadPool()
  private val socketEntries = ConcurrentHashMap<String, SocketEntry>()

  @ReactMethod
  override fun createSocket(config: ReadableMap?, promise: Promise) {
    try {
      val socketId = config?.getStringOrNull("socketId")?.takeIf { it.isNotBlank() } ?: generateSocketId()
      socketEntries.remove(socketId)?.let { closeEntry(it) }
      val socket = buildSocket(config)
      val entry = SocketEntry(socketId, socket)
      entry.future = executor.submit { recvLoop(entry) }
      socketEntries[socketId] = entry
      promise.resolve(socketId)
    } catch (error: Exception) {
      promise.reject("udp_create_error", error)
    }
  }

  @ReactMethod
  override fun send(socketId: String, dataBase64: String, host: String, port: Double, promise: Promise) {
    val entry = socketEntries[socketId]
    if (entry == null) {
      promise.reject("udp_missing_socket", "socket not found: $socketId")
      return
    }
    try {
      val payload = Base64.decode(dataBase64, Base64.NO_WRAP)
      val address = InetAddress.getByName(host)
      val packet = DatagramPacket(payload, payload.size, address, port.toInt())
      entry.socket.send(packet)
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("udp_send_error", error)
    }
  }

  @ReactMethod
  override fun close(socketId: String, promise: Promise) {
    val entry = socketEntries.remove(socketId)
    if (entry == null) {
      promise.resolve(null)
      return
    }
    closeEntry(entry)
    promise.resolve(null)
  }

  @ReactMethod
  override fun closeAll(promise: Promise) {
    val list = socketEntries.values.toList()
    socketEntries.clear()
    list.forEach { closeEntry(it) }
    promise.resolve(null)
  }

  @ReactMethod
  override fun addListener(eventName: String) {
    // 占位以满足事件机制
  }

  @ReactMethod
  override fun removeListeners(count: Double) {
    // 占位以满足事件机制
  }

  override fun onCatalystInstanceDestroy() {
    super.onCatalystInstanceDestroy()
    closeAllSockets()
  }

  private fun closeAllSockets() {
    val list = socketEntries.values.toList()
    socketEntries.clear()
    list.forEach { closeEntry(it) }
  }

  private fun closeEntry(entry: SocketEntry) {
    entry.active.set(false)
    try {
      entry.socket.close()
    } catch (_: Exception) {
    }
    entry.future?.cancel(true)
  }

  private fun buildSocket(config: ReadableMap?): DatagramSocket {
    val localAddress = config?.getStringOrNull("localAddress")
    val localPort = config?.getIntOrNull("localPort")
    val reusePortFlag = config?.getBooleanOrNull("reusePort") ?: false
    val reuseAddressFlag = config?.getBooleanOrNull("reuseAddress") ?: false

    val socket = if (localAddress != null || localPort != null) {
      val inetAddress = if (localAddress != null) InetAddress.getByName(localAddress) else InetAddress.getByName("0.0.0.0")
      val bindPort = localPort ?: 0
      DatagramSocket(null).apply {
        try {
          reuseAddress = reuseAddressFlag || reusePortFlag
        } catch (_: Exception) {
        }
        bind(InetSocketAddress(inetAddress, bindPort))
      }
    } else {
      DatagramSocket().apply {
        try {
          reuseAddress = reuseAddressFlag || reusePortFlag
        } catch (_: Exception) {
        }
      }
    }

    socket.soTimeout = 0
    return socket
  }

  private fun recvLoop(entry: SocketEntry) {
    val buffer = ByteArray(64 * 1024)
    while (entry.active.get()) {
      try {
        val packet = DatagramPacket(buffer, buffer.size)
        entry.socket.receive(packet)
        if (!entry.active.get()) {
          break
        }
        val data = packet.data.copyOfRange(packet.offset, packet.offset + packet.length)
        val encoded = Base64.encodeToString(data, Base64.NO_WRAP)
        emitMessage(
          socketId = entry.socketId,
          remoteHost = packet.address?.hostAddress ?: "",
          remotePort = packet.port,
          base64 = encoded,
          length = data.size
        )
      } catch (error: SocketException) {
        break
      } catch (_: Exception) {
        if (!entry.active.get()) break
      }
    }
  }

  private fun emitMessage(socketId: String, remoteHost: String, remotePort: Int, base64: String, length: Int) {
    val map: WritableMap = Arguments.createMap()
    map.putString("socketId", socketId)
    map.putString("remoteAddress", remoteHost)
    map.putDouble("remotePort", remotePort.toDouble())
    map.putString("dataBase64", base64)
    map.putDouble("length", length.toDouble())
    reactApplicationContext
      .getJSModule(RCTDeviceEventEmitter::class.java)
      .emit(EVENT_ON_MESSAGE, map)
  }

  private fun ReadableMap.getStringOrNull(key: String): String? =
    takeIf { hasKey(key) && !isNull(key) }?.getString(key)

  private fun ReadableMap.getIntOrNull(key: String): Int? =
    takeIf { hasKey(key) && !isNull(key) }?.getDouble(key)?.toInt()

  private fun ReadableMap.getBooleanOrNull(key: String): Boolean? =
    takeIf { hasKey(key) && !isNull(key) }?.getBoolean(key)

  private class SocketEntry(
    val socketId: String,
    val socket: DatagramSocket,
  ) {
    val active: AtomicBoolean = AtomicBoolean(true)
    @Volatile
    var future: Future<*>? = null
  }

  companion object {
    const val NAME = "Udp"
    private const val EVENT_ON_MESSAGE = "udpOnMessage"

    private fun generateSocketId(): String = UUID.randomUUID().toString()
  }
}
