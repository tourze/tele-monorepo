package com.tcpping.protection

import java.net.Socket

/**
 * 外部可注册 VPN 保护逻辑，使 tcp ping 在代理环境下仍可获得真实时延。
 * 若宿主未注册，将按普通网络路径执行。
 */
object TcpPingProtectionRegistry {
  @Volatile private var socketProtector: ((Socket) -> Boolean)? = null
  @Volatile private var vpnActiveChecker: (() -> Boolean)? = null

  @JvmStatic
  fun register(
    protector: ((Socket) -> Boolean)? = null,
    vpnActive: (() -> Boolean)? = null,
  ) {
    socketProtector = protector
    vpnActiveChecker = vpnActive
  }

  @JvmStatic
  fun unregister() {
    socketProtector = null
    vpnActiveChecker = null
  }

  fun protectSocket(socket: Socket): Boolean? {
    return socketProtector?.invoke(socket)
  }

  fun isVpnLikelyActive(): Boolean {
    return vpnActiveChecker?.invoke() ?: false
  }
}
