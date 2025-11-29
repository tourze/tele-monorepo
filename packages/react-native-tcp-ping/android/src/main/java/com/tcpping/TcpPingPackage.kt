package com.tcpping

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.uimanager.ViewManager

class TcpPingPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? =
    if (name == TcpPingModule.NAME) TcpPingModule(reactContext) else null

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider = ReactModuleInfoProvider {
    val map = HashMap<String, ReactModuleInfo>()
    map[TcpPingModule.NAME] = ReactModuleInfo(
      TcpPingModule.NAME,
      TcpPingModule::class.java.name,
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
