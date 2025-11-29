package com.example.ssr

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.net.VpnService
import android.os.IBinder
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableType
import com.facebook.react.module.annotations.ReactModule
import com.github.shadowsocks.utils.Action
import com.github.shadowsocks.utils.Route
import com.github.shadowsocks.utils.State
import com.shadow.ssrclient.database.Profile
import com.shadow.ssrclient.host.HostBridge
import com.reactnative.IShadowsocksService
import com.shadow.ssrclient.service.ShadowsocksVpnService
import java.util.ArrayList

// 中文说明：AIDL 直连库内 Service，实现最小可用链路（配置透传 -> use(1)）
@ReactModule(name = ShadowsocksRModule.NAME)
open class ShadowsocksRModule internal constructor(context: ReactApplicationContext) : NativeShadowsocksRSpec(context) {

  override fun getName(): String = NAME

  @Volatile private var bgService: IShadowsocksService? = null
  @Volatile private var binder: IBinder? = null

  private val serviceConnection = object : ServiceConnection {
    override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
      binder = service
      bgService = IShadowsocksService.Stub.asInterface(service)
    }
    override fun onServiceDisconnected(name: ComponentName?) {
      bgService = null
      binder = null
    }
  }

  private fun ensureBound(ctx: Context) {
    if (bgService != null) return
    // 确保 Service 存活
    ctx.startService(Intent(ctx, ShadowsocksVpnService::class.java))
    // 绑定
    val intent = Intent(ctx, ShadowsocksVpnService::class.java)
    intent.action = Action.SERVICE
    ctx.bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE)
  }

  @ReactMethod
  override fun prepare(promise: Promise) {
    try {
      val ctx = reactApplicationContext
      val i = VpnService.prepare(ctx)
      if (i != null) {
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        ctx.startActivity(i)
        promise.resolve(true)
      } else {
        promise.resolve(true)
      }
    } catch (e: Throwable) {
      promise.reject("prepare_error", e)
    }
  }

  @ReactMethod
  override fun start(
    host: String,
    port: Double,
    password: String?,
    method: String?,
    protocol: String?,
    protocolParam: String?,
    obfs: String?,
    obfsParam: String?,
    route: String?,
    udpdns: Boolean?,
    tunAddresses: ReadableArray?,
    tunRoutes: ReadableArray?,
    udpServers: ReadableArray?,
    udpListenIps: ReadableArray?,
    udpListenPorts: ReadableArray?,
    lanOpen: Boolean?,
    dns: String?,
    chinaDns: String?,
    ipv6: Boolean?,
    allowedApps: ReadableArray?,
    disallowedApps: ReadableArray?,
    forceProxyHosts: ReadableArray?,
    promise: Promise
  ) {
    try {
      val ctx = reactApplicationContext
      // 1) 绑定 Service
      ensureBound(ctx)
      var tries = 10
      while (bgService == null && tries-- > 0) Thread.sleep(50)
      val svc = bgService ?: run { promise.resolve(false); return }

      // 2) 组装 Parcelable SSRProfile 并调用 useProfile
      val sp = com.reactnative.SSRProfile()
      sp.host = host.lowercase()
      sp.remotePort = port.toInt()
      sp.password = password ?: ""
      sp.method = (method ?: "").lowercase()
      sp.protocol = (protocol ?: "origin").lowercase()
      sp.protocol_param = protocolParam ?: ""
      sp.obfs = (obfs ?: "plain").lowercase()
      sp.obfs_param = obfsParam ?: ""
      sp.route = route ?: Route.DEFAULT_SERVER
      sp.udpdns = udpdns ?: false
      readableArrayToStringList(tunAddresses)?.let { sp.tunAddresses = it }
      readableArrayToStringList(tunRoutes)?.let { sp.tunRoutes = it }
      readableArrayToStringList(udpServers)?.let { sp.udpServers = it }
      readableArrayToStringList(udpListenIps)?.let { sp.udpListenIps = it }
      readableArrayToIntList(udpListenPorts)?.let { sp.udpListenPorts = it }
      sp.lanOpen = lanOpen ?: false
      if (!dns.isNullOrBlank()) sp.dns = dns
      if (!chinaDns.isNullOrBlank()) sp.china_dns = chinaDns
      sp.ipv6 = ipv6 ?: false
      readableArrayToStringList(allowedApps)?.let { sp.allowedApps = it }
      readableArrayToStringList(disallowedApps)?.let { sp.disallowedApps = it }
      readableArrayToStringList(forceProxyHosts)?.let { sp.forceProxyHosts = it }

      svc.useProfile(sp)
      promise.resolve(true)
    } catch (_: Throwable) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  override fun stop(promise: Promise) {
    try {
      val ctx = reactApplicationContext
      ensureBound(ctx)
      bgService?.use(-1)
      promise.resolve(true)
    } catch (e: Throwable) {
      promise.resolve(false)
    }
  }

  @ReactMethod
  override fun status(promise: Promise) {
    try {
      val ctx = reactApplicationContext
      ensureBound(ctx)
      val state = bgService?.state ?: State.STOPPED
      when (state) {
        State.CONNECTED -> promise.resolve("CONNECTED")
        State.CONNECTING -> promise.resolve("CONNECTING")
        State.STOPPING -> promise.resolve("STOPPING")
        else -> promise.resolve("STOPPED")
      }
    } catch (_: Throwable) {
      promise.resolve("UNKNOWN")
    }
  }

  companion object { const val NAME = "ShadowsocksR" }

  private fun readableArrayToStringList(array: ReadableArray?): ArrayList<String>? {
    if (array == null || array.size() == 0) return null
    val result = ArrayList<String>()
    for (i in 0 until array.size()) {
      if (array.getType(i) == ReadableType.String) {
        val value = array.getString(i)?.trim()
        if (!value.isNullOrEmpty()) result.add(value)
      }
    }
    return if (result.isEmpty()) null else result
  }

  private fun readableArrayToIntList(array: ReadableArray?): ArrayList<Int>? {
    if (array == null || array.size() == 0) return null
    val result = ArrayList<Int>()
    for (i in 0 until array.size()) {
      when (array.getType(i)) {
        ReadableType.Number -> result.add(array.getInt(i))
        ReadableType.String -> {
          array.getString(i)?.toDoubleOrNull()?.toInt()?.let { result.add(it) }
        }
        else -> {}
      }
    }
    return if (result.isEmpty()) null else result
  }
}
