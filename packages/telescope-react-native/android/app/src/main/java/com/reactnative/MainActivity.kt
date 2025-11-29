package com.reactnative

import android.annotation.SuppressLint
import android.os.Bundle
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.github.shadowsocks.utils.LogUtil
import com.github.shadowsocks.utils.State
import com.shadow.ssrclient.service.ServiceBoundContext
import com.shadow.ssrclient.util.ApkPathChecker
import com.zoontek.rnbootsplash.RNBootSplash
import java.io.File
import java.lang.reflect.Field
import kotlin.system.exitProcess


class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    override fun getMainComponentName(): String = "TelescopeReactNative"

    /**
     * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
     * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

    val handler = Handler()

    var mStatus: Int = State.STOPPED
        get() = field

    var isServiceConnected = false
        get() = field

    // Services
    private val callback = object : IShadowsocksServiceCallback.Stub() {
        override fun stateChanged(s: Int, profileName: String?, m: String?) {
            LogUtil.d(TAG, "MainActivity callback stateChanged: $s")
            MainApplication.getCurrentProfile()
            handler.post {
                updateStatus(s)
            }
        }

        override fun trafficUpdated(txRate: Long, rxRate: Long, txTotal: Long, rxTotal: Long) {
            LogUtil.d(
                    TAG,
                    "MainActivity trafficUpdated txRate:$txRate /s, rxRate: $rxRate /s, txTotal: $txTotal, rxTotal: $rxTotal"
            )

//            val reactContext = this@MainActivity.getReactNativeHost().reactInstanceManager.currentReactContext
//            if (reactContext != null) {
//                try {
//                    val trafficModule = reactContext.getNativeModule(CalendarModule::class.java)
//                    trafficModule?.sendTrafficUpdate(txRate, rxRate, txTotal, rxTotal)
//                } catch (e: Throwable) {
//                    Log.d(TAG, "trafficUpdated error: $e");
//                }
//            }
        }
    }

    private lateinit var backgroundThread: HandlerThread
    private lateinit var backgroundHandler: Handler

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme); // ⬅️ initialize the splash screen

        //SplashScreen.show(this)
        //super.onCreate(savedInstanceState)
        // https://github.com/software-mansion/react-native-screens#android 参考这个进行修改
        super.onCreate(null)

        if (!checkPMProxy()) {
            exitProcess(0)
        }

        if (isFridaServerInDevice()) {
            exitProcess(0)
        }

        // 创建一个HandlerThread
        backgroundThread = HandlerThread("ApkPathCheckerThread")
        backgroundThread.start()
        // 创建一个Handler与HandlerThread的Looper相关联
        backgroundHandler = Handler(backgroundThread.looper)
        // 在后台线程中运行检查
        backgroundHandler.post {
            ApkPathChecker.checkApkPath(this)
        }
    }

    override fun onResume() {
        super.onResume()

        if (!checkPMProxy()) {
            exitProcess(0)
        }

        if (isFridaServerInDevice()) {
            exitProcess(0)
        }

        val properties: MutableMap<String, String> = HashMap()
        properties["function"] = "onResume"
        properties["isServiceConnected"] = isServiceConnected.toString()
        LogUtil.i(TAG, properties)

        if (!isServiceConnected) {
            attachService()
        }
    }

    /**
     * 遍历data/local/tmp目录查看有无frida相关文件，检查是不是有启动Frida
     */
    fun isFridaServerInDevice(): Boolean {
        if (File("/data/local/tmp/frida-server").exists() ||
                File("/data/local/tmp/re.frida.server").exists() ||
                File("/sdcard/re.frida.server").exists() ||
                File("/sdcard/frida-server").exists()) {
            Log.d(TAG, "TAMPERPROOF [0] - Hooking detector trigger due to frida-server was found in /data/local/tmp/")
            return true
        }
        return false
    }

    /**
     * 检测 PM 代理
     */
    @SuppressLint("PrivateApi")
    private fun checkPMProxy(): Boolean {
        val truePMName = "android.content.pm.IPackageManager\$Stub\$Proxy"
        var currentPMName = ""

        try {
            // 被代理的对象是 PackageManager.mPM
            val packageManager = packageManager
            val mPMField: Field = packageManager.javaClass.getDeclaredField("mPM")
            mPMField.isAccessible = true
            val mPM: Any? = mPMField.get(packageManager)
            // 取得类名
            currentPMName = mPM?.javaClass?.name.orEmpty()
        } catch (e: java.lang.Exception) {
            //e.printStackTrace()
        }
        // 类名改变说明被代理了
        return truePMName == currentPMName
    }

    private val serviceBoundContext = object : ServiceBoundContext(this) {
        override fun onServiceConnected() {
            isServiceConnected = true
            try {
                val properties: MutableMap<String, String> = HashMap()
                properties["function"] = "onServiceConnected"
                properties["bgServiceState"] = "${this.bgService?.state}"
                LogUtil.i(TAG, properties)

                this.bgService?.state?.let {
                    runOnUiThread {
                        LogUtil.d(TAG, "updateStatus ${this.bgService?.state}")
                        updateStatus(it)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        override fun onServiceDisconnected() {
            isServiceConnected = false
            LogUtil.d(TAG, "onServiceDisconnected")
        }

        override fun binderDied() {
            detachService()
            MainApplication.app!!.crashRecovery()
            this@MainActivity.attachService()
        }
    }

    fun attachService() {
        serviceBoundContext.attachService(callback)
    }

    override fun onDestroy() {
        serviceBoundContext.detachService()
        super.onDestroy()

        // 停止HandlerThread
        backgroundThread.quitSafely()
    }

    /**
     * 停止服务
     */
    fun stopService(): Boolean {
        try {
            LogUtil.i(TAG, "stopService start")
            serviceBoundContext.bgService?.use(-1)
        } catch (e: Exception) {
            LogUtil.e(TAG, "stopService error:" + e.message)
            e.printStackTrace()
            return false
        }
        return true
    }

    private var serviceWaitLoadTime: Long = 0
    private fun serviceWaitLoad(profileId: Int) {
        if (System.currentTimeMillis() - serviceWaitLoadTime < 5000) {
            if (isServiceConnected) {
                serviceBoundContext.bgService?.use(profileId)
                LogUtil.d(TAG, "serviceWaitLoad use id:${profileId}")
            } else {
                handler.postDelayed({ serviceWaitLoad(profileId) }, 500)
            }
        }
    }

    /**
     * 连接VPN服务
     */
    fun serviceLoad(): Boolean {
        if (MainApplication.getCurrentProfile() == null) {
            LogUtil.d(TAG, "serviceLoad no currentProfile")
            return false
        }

        try {
            // 约定：如果等于1的话，就读取js那边传递过来的配置
            var id = 1

            if (isServiceConnected) {
                serviceBoundContext.bgService?.use(id)
                LogUtil.d(TAG, "serviceLoad use id:${id}")
            } else {
                serviceWaitLoadTime = System.currentTimeMillis()
                handler.postDelayed({
                    serviceWaitLoad(id)
                }, 500)
            }
        } catch (e: Exception) {
            LogUtil.e(TAG, "" + e.message)
            e.printStackTrace()
        }
        return true
    }

    fun updateStatus(status: Int) {
        LogUtil.i(TAG, "更新连接状态:$status")
        mStatus = status
    }

    companion object {
        private const val TAG = "MainActivity"
    }
}
