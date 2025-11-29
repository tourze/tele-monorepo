package com.reactnativecurl

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import org.json.JSONArray
import org.json.JSONObject

@ReactModule(name = CurlModule.NAME)
class CurlModule internal constructor(context: ReactApplicationContext) : NativeCurlSpec(context) {
  override fun getName(): String = NAME

  private val executor: ExecutorService = Executors.newCachedThreadPool()
  private val inFlightRequests = ConcurrentHashMap<String, Boolean>()

  @ReactMethod
  override fun performRequest(options: ReadableMap, promise: Promise) {
    val parsed = try {
      CurlRequestOptions.fromReadableMap(options)
    } catch (error: Exception) {
      val map = buildErrorMap(
        requestId = options.takeIf { it.hasKey("requestId") }?.getString("requestId"),
        code = "invalid_argument",
        message = error.message ?: "invalid options"
      )
      promise.resolve(map)
      return
    }

    inFlightRequests[parsed.requestId] = true

    executor.execute {
      val responseMap = try {
        val responseJson = CurlNativeBridge.performRequest(parsed.toJsonString())
        val response = CurlResponseData.fromJson(responseJson)
        response.toWritableMap()
      } catch (error: Exception) {
        buildErrorMap(parsed.requestId, "native_error", error.message ?: error.toString())
      } finally {
        inFlightRequests.remove(parsed.requestId)
      }
      promise.resolve(responseMap)
    }
  }

  @ReactMethod
  override fun cancelRequest(requestId: String, promise: Promise) {
    if (requestId.isEmpty()) {
      promise.resolve(null)
      return
    }
    try {
      CurlNativeBridge.cancelRequest(requestId)
    } catch (_: Exception) {
      // 忽略 native 层取消失败
    } finally {
      inFlightRequests.remove(requestId)
      promise.resolve(null)
    }
  }

  @ReactMethod
  override fun addListener(eventName: String) {
    // React Native 事件机制要求实现，实际无需处理
  }

  @ReactMethod
  override fun removeListeners(count: Double) {
    // React Native 事件机制要求实现，实际无需处理
  }

  private fun buildErrorMap(requestId: String?, code: String, message: String): WritableMap {
    val map = Arguments.createMap()
    requestId?.let { map.putString("requestId", it) }
    map.putBoolean("ok", false)
    map.putNull("status")
    map.putNull("statusText")
    map.putNull("responseUrl")
    map.putArray("headers", Arguments.createArray())
    map.putNull("bodyBase64")
    map.putString("errorCode", code)
    map.putString("errorMessage", message)
    map.putNull("timing")
    return map
  }

  companion object {
    const val NAME = "Curl"
  }
}

data class CurlHeader(val name: String, val value: String) {
  fun toJson(): JSONObject = JSONObject().apply {
    put("name", name)
    put("value", value)
  }

  fun toWritableMap(): WritableMap = Arguments.createMap().apply {
    putString("name", name)
    putString("value", value)
  }

  companion object {
    fun fromReadableMap(map: ReadableMap): CurlHeader? {
      val name = map.takeIf { it.hasKey("name") }?.getString("name")?.takeIf { it.isNotEmpty() } ?: return null
      val value = map.takeIf { it.hasKey("value") }?.getString("value") ?: ""
      return CurlHeader(name, value)
    }

    fun fromJson(obj: JSONObject): CurlHeader? {
      val name = obj.optString("name", "")
      if (name.isEmpty()) return null
      val value = obj.optString("value", "")
      return CurlHeader(name, value)
    }
  }
}

data class CurlTiming(
  val nameLookupMs: Double? = null,
  val connectMs: Double? = null,
  val appConnectMs: Double? = null,
  val preTransferMs: Double? = null,
  val startTransferMs: Double? = null,
  val redirectMs: Double? = null,
  val totalMs: Double? = null
) {
  fun toWritableMap(): WritableMap = Arguments.createMap().apply {
    nameLookupMs?.let { putDouble("nameLookupMs", it) }
    connectMs?.let { putDouble("connectMs", it) }
    appConnectMs?.let { putDouble("appConnectMs", it) }
    preTransferMs?.let { putDouble("preTransferMs", it) }
    startTransferMs?.let { putDouble("startTransferMs", it) }
    redirectMs?.let { putDouble("redirectMs", it) }
    totalMs?.let { putDouble("totalMs", it) }
  }

  companion object {
    fun fromJson(obj: JSONObject?): CurlTiming? {
      if (obj == null) return null
      return CurlTiming(
        obj.optDoubleOrNull("nameLookupMs"),
        obj.optDoubleOrNull("connectMs"),
        obj.optDoubleOrNull("appConnectMs"),
        obj.optDoubleOrNull("preTransferMs"),
        obj.optDoubleOrNull("startTransferMs"),
        obj.optDoubleOrNull("redirectMs"),
        obj.optDoubleOrNull("totalMs")
      )
    }
  }
}

data class CurlRequestOptions(
  val requestId: String,
  val url: String,
  val method: String?,
  val headers: List<CurlHeader>,
  val bodyBase64: String?,
  val timeoutMs: Int?,
  val connectTimeoutMs: Int?,
  val followRedirects: Boolean?,
  val allowInsecure: Boolean?,
  val pinnedPublicKeys: List<String>?,
  val caCertPem: String?,
  val ipOverride: String?,
  val dnsServers: List<String>?,
  val httpVersion: String?,
  val acceptEncoding: String?,
  val maxRedirects: Int?
) {
  fun toJsonString(): String {
    val obj = JSONObject()
    obj.put("requestId", requestId)
    obj.put("url", url)
    method?.let { obj.put("method", it) }
    if (headers.isNotEmpty()) {
      val array = JSONArray()
      headers.forEach { array.put(it.toJson()) }
      obj.put("headers", array)
    }
    bodyBase64?.let { obj.put("bodyBase64", it) }
    timeoutMs?.let { obj.put("timeoutMs", it) }
    connectTimeoutMs?.let { obj.put("connectTimeoutMs", it) }
    followRedirects?.let { obj.put("followRedirects", it) }
    allowInsecure?.let { obj.put("allowInsecure", it) }
    pinnedPublicKeys?.takeIf { it.isNotEmpty() }?.let { obj.put("pinnedPublicKeys", JSONArray(it)) }
    caCertPem?.let { obj.put("caCertPem", it) }
    ipOverride?.let { obj.put("ipOverride", it) }
    dnsServers?.takeIf { it.isNotEmpty() }?.let { obj.put("dnsServers", JSONArray(it)) }
    httpVersion?.let { obj.put("httpVersion", it) }
    acceptEncoding?.let { obj.put("acceptEncoding", it) }
    maxRedirects?.let { obj.put("maxRedirects", it) }
    return obj.toString()
  }

  companion object {
    private fun ReadableMap.getStringOrNull(key: String): String? =
      takeIf { hasKey(key) && !isNull(key) }?.getString(key)

    private fun ReadableMap.getBooleanOrNull(key: String): Boolean? =
      takeIf { hasKey(key) && !isNull(key) }?.getBoolean(key)

    private fun ReadableMap.getIntOrNull(key: String): Int? =
      takeIf { hasKey(key) && !isNull(key) }?.getDouble(key)?.toInt()

    fun fromReadableMap(map: ReadableMap): CurlRequestOptions {
      val requestId =
        map.getStringOrNull("requestId")?.takeIf { it.isNotBlank() } ?: throw IllegalArgumentException("requestId required")
      val url = map.getStringOrNull("url")?.takeIf { it.isNotBlank() } ?: throw IllegalArgumentException("url required")
      val method = map.getStringOrNull("method")
      val headers = map.getArrayOrNull("headers")?.let { toHeaderList(it) } ?: emptyList()
      val bodyBase64 = map.getStringOrNull("bodyBase64")
      val timeoutMs = map.getIntOrNull("timeoutMs")
      val connectTimeoutMs = map.getIntOrNull("connectTimeoutMs")
      val followRedirects = map.getBooleanOrNull("followRedirects")
      val allowInsecure = map.getBooleanOrNull("allowInsecure")
      val pinned = map.getArrayOrNull("pinnedPublicKeys")?.let { toStringList(it) }
      val caCertPem = map.getStringOrNull("caCertPem")
      val ipOverride = map.getStringOrNull("ipOverride")
      val dnsServers = map.getArrayOrNull("dnsServers")?.let { toStringList(it) }
      val httpVersion = map.getStringOrNull("httpVersion")
      val acceptEncoding = map.getStringOrNull("acceptEncoding")
      val maxRedirects = map.getIntOrNull("maxRedirects")

      return CurlRequestOptions(
        requestId = requestId,
        url = url,
        method = method,
        headers = headers,
        bodyBase64 = bodyBase64,
        timeoutMs = timeoutMs,
        connectTimeoutMs = connectTimeoutMs,
        followRedirects = followRedirects,
        allowInsecure = allowInsecure,
        pinnedPublicKeys = pinned,
        caCertPem = caCertPem,
        ipOverride = ipOverride,
        dnsServers = dnsServers,
        httpVersion = httpVersion,
        acceptEncoding = acceptEncoding,
        maxRedirects = maxRedirects
      )
    }

    private fun ReadableMap.getArrayOrNull(key: String): ReadableArray? =
      takeIf { hasKey(key) && !isNull(key) }?.getArray(key)

    private fun toHeaderList(array: ReadableArray): List<CurlHeader> {
      val result = ArrayList<CurlHeader>(array.size())
      for (i in 0 until array.size()) {
        val map = array.getMap(i) ?: continue
        val header = CurlHeader.fromReadableMap(map) ?: continue
        result.add(header)
      }
      return result
    }

    private fun toStringList(array: ReadableArray): List<String> {
      val result = ArrayList<String>(array.size())
      for (i in 0 until array.size()) {
        if (!array.isNull(i)) {
          val value = array.getString(i)
          if (!value.isNullOrEmpty()) {
            result.add(value)
          }
        }
      }
      return result
    }
  }
}

data class CurlResponseData(
  val requestId: String?,
  val ok: Boolean,
  val status: Int?,
  val statusText: String?,
  val responseUrl: String?,
  val headers: List<CurlHeader>,
  val bodyBase64: String?,
  val errorCode: String?,
  val errorMessage: String?,
  val timing: CurlTiming?
) {
  fun toWritableMap(): WritableMap {
    val map = Arguments.createMap()
    requestId?.let { map.putString("requestId", it) }
    map.putBoolean("ok", ok)
    status?.let { map.putInt("status", it) } ?: map.putNull("status")
    statusText?.let { map.putString("statusText", it) } ?: map.putNull("statusText")
    responseUrl?.let { map.putString("responseUrl", it) } ?: map.putNull("responseUrl")
    map.putArray("headers", headersToWritableArray(headers))
    bodyBase64?.let { map.putString("bodyBase64", it) } ?: map.putNull("bodyBase64")
    errorCode?.let { map.putString("errorCode", it) } ?: map.putNull("errorCode")
    errorMessage?.let { map.putString("errorMessage", it) } ?: map.putNull("errorMessage")
    timing?.let { map.putMap("timing", it.toWritableMap()) } ?: map.putNull("timing")
    return map
  }

  companion object {
    fun fromJson(json: String): CurlResponseData {
      val obj = JSONObject(json)
      val headersJson = obj.optJSONArray("headers")
      val headers = ArrayList<CurlHeader>()
      if (headersJson != null) {
        for (i in 0 until headersJson.length()) {
          val headerObj = headersJson.optJSONObject(i) ?: continue
          val header = CurlHeader.fromJson(headerObj) ?: continue
          headers.add(header)
        }
      }
      return CurlResponseData(
        requestId = obj.optStringOrNull("requestId"),
        ok = obj.optBoolean("ok", false),
        status = obj.optIntOrNull("status"),
        statusText = obj.optStringOrNull("statusText"),
        responseUrl = obj.optStringOrNull("responseUrl"),
        headers = headers,
        bodyBase64 = obj.optStringOrNull("bodyBase64"),
        errorCode = obj.optStringOrNull("errorCode"),
        errorMessage = obj.optStringOrNull("errorMessage"),
        timing = CurlTiming.fromJson(obj.optJSONObject("timing"))
      )
    }

    private fun headersToWritableArray(headers: List<CurlHeader>): WritableArray {
      val array = Arguments.createArray()
      headers.forEach { array.pushMap(it.toWritableMap()) }
      return array
    }
  }
}

object CurlNativeBridge {
  init {
    try {
      System.loadLibrary("reactnativecurl")
    } catch (_: UnsatisfiedLinkError) {
      // 提前捕获，避免应用在未编译 native 库时直接崩溃
    }
  }

  external fun performRequest(optionsJson: String): String
  external fun cancelRequest(requestId: String)
}

private fun JSONObject.optStringOrNull(name: String): String? {
  if (!has(name)) return null
  if (isNull(name)) return null
  val value = optString(name, null)
  return value
}

private fun JSONObject.optIntOrNull(name: String): Int? {
  if (!has(name)) return null
  if (isNull(name)) return null
  return try {
    getInt(name)
  } catch (_: Exception) {
    null
  }
}

private fun JSONObject.optDoubleOrNull(name: String): Double? {
  if (!has(name)) return null
  if (isNull(name)) return null
  return try {
    getDouble(name)
  } catch (_: Exception) {
    null
  }
}
    private fun ReadableMap.getArrayOrNull(key: String): ReadableArray? =
      takeIf { hasKey(key) && !isNull(key) }?.getArray(key)
