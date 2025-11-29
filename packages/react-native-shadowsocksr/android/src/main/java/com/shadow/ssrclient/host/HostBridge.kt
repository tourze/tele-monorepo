package com.shadow.ssrclient.host

import android.app.Application
import android.content.Context
import com.shadow.ssrclient.database.Profile

// 中文说明：宿主桥（由宿主 App 在 Application.onCreate 中初始化），避免库侧直接依赖 MainApplication
object HostBridge {
  interface HostDelegate {
    fun getCurrentProfile(): Profile?
    fun setCurrentProfile(p: Profile)
    fun updateAssets()
    fun track(t: Throwable)
    fun track(category: String, action: String)
    fun crashRecovery()
  }

  @Volatile var appContext: Context? = null
    private set

  @Volatile var delegate: HostDelegate? = null

  @JvmStatic fun init(app: Application, d: HostDelegate?) {
    appContext = app.applicationContext
    delegate = d
  }

  // 读取/写入 Profile（默认走宿主实现；无宿主时返回 null/忽略）
  @JvmStatic fun getCurrentProfile(): Profile? = delegate?.getCurrentProfile()
  @JvmStatic fun setCurrentProfile(p: Profile) { delegate?.setCurrentProfile(p) }

  // 资产复制与崩溃恢复
  @JvmStatic fun updateAssets() { delegate?.updateAssets() }
  @JvmStatic fun crashRecovery() { delegate?.crashRecovery() }

  // 追踪
  @JvmStatic fun track(t: Throwable) { delegate?.track(t) }
  @JvmStatic fun track(category: String, action: String) { delegate?.track(category, action) }

  // 数据目录
  @JvmStatic fun dataDir(): String = appContext?.applicationInfo?.dataDir ?: ""
}

