package com.reactnative

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import android.preference.PreferenceManager
import android.util.Log
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.flipper.ReactNativeFlipper
import com.facebook.react.modules.network.OkHttpClientProvider
import com.facebook.soloader.SoLoader
import com.github.shadowsocks.utils.Executable
import com.github.shadowsocks.utils.IOUtils
import com.github.shadowsocks.utils.Key
import com.github.shadowsocks.utils.LogUtil
import com.reactnative.BuildConfig
import com.shadow.ssrclient.database.Profile
import com.shadow.ssrclient.dns.CustomClientFactory
import com.shadow.ssrclient.util.AppUtils
import com.shadow.ssrclient.util.DebuggerUtils
import com.shadow.ssrclient.host.HostBridge
import com.shadow.ssrclient.service.ShadowsocksVpnService
import com.tcpping.protection.TcpPingProtectionRegistry
import eu.chainfire.libsuperuser.Shell
import timber.log.Timber
import java.io.FileOutputStream
import java.io.IOException
import java.util.Locale
import kotlin.system.exitProcess


class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
    object : DefaultReactNativeHost(this) {
      override fun getPackages(): List<ReactPackage> =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          add(CalendarPackage())
        }

      override fun getJSMainModuleName(): String = "src/main"

      override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

      override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
    }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(applicationContext, reactNativeHost)

    var settings: SharedPreferences? = null
    var editor: SharedPreferences.Editor? = null

    override fun attachBaseContext(base: Context) {
        super.attachBaseContext(base)
    }

    override fun onCreate() {
        super.onCreate()
        app = this
        // 初始化宿主桥，向库侧提供回调能力
        HostBridge.init(this, object : HostBridge.HostDelegate {
            override fun getCurrentProfile(): Profile? = MainApplication.getCurrentProfile()
            override fun setCurrentProfile(p: Profile) = MainApplication.setCurrentProfile(p)
            override fun updateAssets() = this@MainApplication.updateAssets()
            override fun track(t: Throwable) = this@MainApplication.track(t)
            override fun track(category: String, action: String) = this@MainApplication.track(category, action)
            override fun crashRecovery() = this@MainApplication.crashRecovery()
        })

        TcpPingProtectionRegistry.register(
            protector = { socket -> ShadowsocksVpnService.protectSocket(socket) },
            vpnActive = { ShadowsocksVpnService.isVpnActive() }
        )

        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }

        if (!BuildConfig.DEBUG) {
            // 反调试
            DebuggerUtils.checkDebuggableInNotDebugModel(this.applicationContext)

            // 阻止HookApplication执行
            if (!checkApplication()) {
                exitProcess(0)
            }

            // TODO ROOT设备调试的话，直接退出，这个要评估是否值得做

            // TODO 模拟器运行检测，这个要评估是否值得做
        }

        // 我们需要自己处理一次dns，所以这里传入一个自己的Client构造器
        OkHttpClientProvider.setOkHttpClientFactory(CustomClientFactory());

        SoLoader.init(this, false)
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            // If you opted-in for the New Architecture, we load the native entry point for this app.
            load()
        }
        ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)

        settings = PreferenceManager.getDefaultSharedPreferences(this)
        editor = settings!!.edit()

        app?.updateAssets()
    }

    /**
     * 校验 application
     */
    private fun checkApplication(): Boolean {
        val nowApplication: Application = applicationContext as Application
        val trueApplicationName = MainApplication::class.java.simpleName
        val nowApplicationName = nowApplication.javaClass.simpleName
        return trueApplicationName == nowApplicationName
    }

    fun track(t: Throwable) {
        t.printStackTrace()
        LogUtil.i(TAG, t.stackTraceToString())
    }

    fun track(category: String, action: String) {
        LogUtil.i(category, action)
    }

    fun crashRecovery() {
        val task = arrayOf("ss-local", "ss-tunnel", "pdnsd", "tun2socks", "proxychains")
        val dataDir = AppUtils.getDataDir()
        var cmd: MutableList<String> = ArrayList<String>()

        task.forEach {
            cmd.add("killall %s".format(Locale.ENGLISH, it))
            cmd.add(
                    "rm -f %s/%s-nat.conf %s/%s-vpn.conf".format(
                            Locale.ENGLISH,
                            dataDir,
                            it,
                            dataDir,
                            it
                    )
            )
        }
//        if (app!!.isNatEnabled) {
//            cmd.add("iptables -t nat -F OUTPUT")
//            cmd.add("echo done")
//            val result = Shell.SU.run(cmd)
//            if (result != null && result.isNotEmpty()) return // fallback to SH
//        }
        Shell.SH.run(cmd)
    }

    private val EXECUTABLES = arrayOf(
            Executable.PDNSD,
            Executable.SS_TUNNEL,
            Executable.SS_LOCAL,
            Executable.TUN2SOCKS,
            Executable.KCPTUN
    )

    fun updateAssets() {
        if (settings?.getInt(Key.currentVersionCode, -1) != BuildConfig.VERSION_CODE) copyAssets()
    }

    private fun copyAssets(path: String) {
        val assetManager = assets
        var files: Array<String>? = null
        try {
            files = assetManager.list(path)

        } catch (e: IOException) {
            e.message?.let { Log.e(TAG, it) }
            app!!.track(e)
        }
        if (files != null) {
            val dataDir = AppUtils.getDataDir()
            files.forEach continuing@{
                var input = assetManager.open(if (path.isNotEmpty()) "$path/$it" else it)
                var output = FileOutputStream("$dataDir/$it")
                IOUtils.copy(input, output)
                input.close()
                output.close()
            }
        }
    }

    private fun copyAssets() {
        crashRecovery() // ensure executables are killed before writing to them

        // 将一些默认的assets文件复制过去？
        copyAssets(com.github.shadowsocks.System.getABI())
        copyAssets("acl")

        var list: MutableList<String> = ArrayList<String>()
        val dataDir = AppUtils.getDataDir()
        EXECUTABLES.forEach {
            list.add("chmod 755 $dataDir/$it")
        }
        Shell.SH.run(list)
        editor?.putInt(Key.currentVersionCode, BuildConfig.VERSION_CODE)?.apply()
    }

    companion object {
        var app: MainApplication? = null
        const val TAG = "MainApplication"

        private val lock = Any()

        @Volatile
        private var useProfile: Profile? = null

        @Synchronized
        fun setCurrentProfile(profile: Profile) {
            //synchronized(lock) {
            LogUtil.d(TAG, "setCurrentProfile 1 ${profile.host}")
            useProfile = profile
            LogUtil.d(TAG, "setCurrentProfile 2 ${profile.host}")
            // }
        }

        @Synchronized
        fun getCurrentProfile(): Profile? {
            //synchronized(lock) {
            val profile = useProfile
            if (useProfile == null) {
                LogUtil.d(TAG, "getCurrentProfile no value111")
            } else {
                LogUtil.d(TAG, "getCurrentProfile return: ${profile?.host}")
            }
            return profile
            // }
        }
    }
}
