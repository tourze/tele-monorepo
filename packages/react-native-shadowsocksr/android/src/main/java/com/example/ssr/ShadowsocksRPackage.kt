package com.example.ssr

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

// 中文说明：TurboPackage 注册，支持新旧架构自动链接
class ShadowsocksRPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == ShadowsocksRModule.NAME) ShadowsocksRModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    val map = HashMap<String, ReactModuleInfo>()
    map[ShadowsocksRModule.NAME] = ReactModuleInfo(
      ShadowsocksRModule.NAME,
      ShadowsocksRModule::class.java.name,
      false,
      false,
      false,
      false,
      true
    )
    map
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

