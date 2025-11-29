package com.reactnative

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import androidx.annotation.RequiresApi
import androidx.core.content.FileProvider
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.github.shadowsocks.utils.LogUtil
import com.github.shadowsocks.utils.Route
import com.github.shadowsocks.utils.State
import com.github.shadowsocks.utils.SystemUtil
import com.google.gson.Gson
import com.shadow.ssrclient.database.Profile
import com.shadow.ssrclient.dns.HttpDns
import com.shadow.ssrclient.util.AppUtils
import com.shadow.ssrclient.util.DxNetworkUtil
import de.javawi.jstun.attribute.MessageAttributeParsingException
import de.javawi.jstun.header.MessageHeaderParsingException
import de.javawi.jstun.test.DiscoveryInfo
import de.javawi.jstun.test.DiscoveryTest
import de.javawi.jstun.util.UtilityException
import java.io.BufferedReader
import java.io.File
import java.io.IOException
import java.io.InputStreamReader
import java.net.InetAddress
import java.net.SocketException
import java.net.UnknownHostException
 
import java.util.concurrent.TimeUnit


class CalendarModule(reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    private val preferences: SharedPreferences

    init {
        preferences = reactApplicationContext.getSharedPreferences("config", Context.MODE_PRIVATE)
    }

    override fun getName(): String {
        return "TTManager"
    }

    @ReactMethod
    fun getPackageName(promise: Promise) {
        promise.resolve(reactApplicationContext.packageName)
    }

    @ReactMethod
    fun getDataDir(promise: Promise) {
        val value = AppUtils.getDataDir()
        promise.resolve(value)
    }

    @ReactMethod
    fun getHardwareUUID(promise: Promise) {
        val value = SystemUtil.getIMEI(this.reactApplicationContext)
        if (value != null) {
            promise.resolve(value)
        } else {
            promise.reject("error", "Cannot find hardware uuid")
        }
    }

    // 注意：原生 TCP Ping 已迁移到独立包 react-native-tcp-ping，JS 侧请直接使用该包。

    @ReactMethod
    fun setConfig(key: String?, value: String?) {
        val editor = preferences.edit()
        editor.putString(key, value)
        editor.apply()
    }

    @ReactMethod
    fun getConfig(key: String?, promise: Promise) {
        val value = preferences.getString(key, null)
        if (value != null) {
            val map = Arguments.createMap()
            map.putString("value", value)
            promise.resolve(map)
        } else {
            promise.reject("error", "Cannot find the key")
        }
    }

    @ReactMethod
    fun getSystemVersion(promise: Promise) {
        val value = SystemUtil.getSystemVersion()
        if (value != null) {
            promise.resolve(value)
        } else {
            promise.reject("error", "Cannot find the system version")
        }
    }

    @ReactMethod
    fun getVersionName(promise: Promise) {
        val value = SystemUtil.getVersionName(this.reactApplicationContext)
        promise.resolve(value)
    }

    @ReactMethod
    fun getVersionCode(promise: Promise) {
        val value = SystemUtil.getVersionCode(this.reactApplicationContext)
        promise.resolve(value)
    }

    @ReactMethod
    fun getChannelName(promise: Promise) {
        promise.resolve(BuildConfig.CHANNEL_NAME)
    }

    /**
     * 获取已安装的应用列表
     */
    @ReactMethod
    fun getPackageList(promise: Promise) {
        val packages = Arguments.createArray()
        val packageManager: PackageManager = reactApplicationContext.getPackageManager()
        try {
            val packageInfos: List<PackageInfo> = packageManager.getInstalledPackages(PackageManager.GET_ACTIVITIES or
                    PackageManager.GET_SERVICES)
            for (info in packageInfos) {
                val packageInfo = Arguments.createMap()
                packageInfo.putString("appName", info.applicationInfo.loadLabel(packageManager) as String)
                packageInfo.putString("packageName", info.packageName)
                packageInfo.putInt("versionCode", info.versionCode)
                packageInfo.putString("versionName", info.versionName)
                packageInfo.putInt("installDate", info.firstInstallTime.toInt())
                packages.pushMap(packageInfo)
            }
        } catch (t: Throwable) {
            t.printStackTrace()
        }
        promise.resolve(packages)
    }

    @ReactMethod
    fun executeCommand(command: String?, promise: Promise) {
        // 执行系统命令
        try {
            val process = Runtime.getRuntime().exec(command)
            val reader = BufferedReader(InputStreamReader(process.getInputStream()))
            val output = StringBuilder()
            var line: String?
            while (reader.readLine().also { line = it } != null) {
                output.append(line).append("\n")
            }
            process.waitFor()
            if (process.exitValue() === 0) {
                promise.resolve(output.toString())
            } else {
                promise.reject("ERROR", "Command execution failed")
            }
        } catch (e: java.lang.Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun exitApp() {
        // https://github.com/wumke/react-native-exit-app/blob/master/android/src/main/java/com/github/wumke/RNExitApp/RNExitAppModule.java
        Process.killProcess(Process.myPid())
    }

    @ReactMethod
    fun getServiceStatus(promise: Promise) {
        (currentActivity as ReactActivity).runOnUiThread {
            try {
                val mainActivity = currentActivity as MainActivity
                LogUtil.d(TAG, "getServiceStatus: ${mainActivity.mStatus}")
                promise.resolve(!State.isAvailable(mainActivity.mStatus))
            } catch (e: Exception) {
                promise.reject(e)
                LogUtil.e(TAG, "getServiceStatus: ${e.stackTraceToString()}")
            }
        }
    }

    @ReactMethod
    fun stopVService(promise: Promise) {
        (currentActivity as ReactActivity).runOnUiThread {
            try {
                val mainActivity = currentActivity as MainActivity
                promise.resolve(mainActivity.stopService())
            } catch (e: Exception) {
                promise.reject(e)
                LogUtil.e(TAG, "stopVService: ${e.stackTraceToString()}")
            }
        }
    }

    @ReactMethod
    fun startVService(server: ReadableMap, promise: Promise) {
        (currentActivity as ReactActivity).runOnUiThread {
            val mainActivity = currentActivity as MainActivity

            LogUtil.d(TAG, "startVService got server info: " + Gson().toJson(server.toHashMap()))

            val profile = Profile()

            // 路由模式，全局 or 智能
            if (server.hasKey("route")) {
                profile.route = server.getString("route")
            } else {
                profile.route = Route.DEFAULT_SERVER
            }

            profile.host = server.getString("ip")!!.lowercase()
            profile.remotePort = server.getInt("port")
            profile.protocol = server.getString("protocol")!!.lowercase()
            profile.method = server.getString("method")!!.lowercase()
            profile.obfs = server.getString("obfs")!!.lowercase()
            profile.password = server.getString("passwd")
            profile.obfs_param = server.getString("obfsparam")
            profile.protocol_param = server.getString("protoparam")
            profile.name = server.getString("name")
            profile.flag = server.getString("flag")
            profile.useGost = server.getBoolean("isGost");
            if (server.hasKey("user_id")) {
                profile.userId = server.getInt("user_id");
            }
            if (server.hasKey("user_pass")) {
                profile.userPass = server.getString("user_pass");
            }

            // 局域网支持
            if (server.hasKey("lanOpen")) {
                profile.lanOpen = server.getBoolean("lanOpen");
            } else {
                profile.lanOpen = false;
            }

            // 设置自定义的路由信息
            if (server.hasKey("tunAddresses") && !server.isNull("tunAddresses")) {
                val tunAddressesArray: ReadableArray? = server.getArray("tunAddresses")
                if (tunAddressesArray != null) {
                    val tunAddressesList: MutableList<String> = mutableListOf()
                    for (i in 0 until tunAddressesArray.size()) {
                        if (tunAddressesArray.getType(i) == ReadableType.String) {
                            tunAddressesList.add(tunAddressesArray.getString(i))
                        }
                    }
                    profile.tunAddresses = tunAddressesList
                }
            } else {
                profile.tunAddresses = null
            }

            if (server.hasKey("tunRoutes") && !server.isNull("tunRoutes")) {
                val tunRoutesArray: ReadableArray? = server.getArray("tunRoutes")
                if (tunRoutesArray != null) {
                    val tunRoutesList: MutableList<String> = mutableListOf()
                    for (i in 0 until tunRoutesArray.size()) {
                        if (tunRoutesArray.getType(i) == ReadableType.String) {
                            tunRoutesList.add(tunRoutesArray.getString(i))
                        }
                    }
                    profile.tunRoutes = tunRoutesList
                }
            } else {
                profile.tunRoutes = null
            }

            // UDP监听服务支持
            if (server.hasKey("udpServers")) {
                val arr: ReadableArray? = server.getArray("udpServers")
                if (arr != null) {
                    val newArr: MutableList<String> = mutableListOf()
                    for (i in 0 until arr.size()) {
                        if (arr.getType(i) == ReadableType.String) {
                            newArr.add(arr.getString(i))
                        }
                    }
                    profile.udpServers = newArr
                }
            } else {
                profile.udpServers = null
            }
            if (server.hasKey("udpListenIps")) {
                val arr: ReadableArray? = server.getArray("udpListenIps")
                if (arr != null) {
                    val newArr: MutableList<String> = mutableListOf()
                    for (i in 0 until arr.size()) {
                        if (arr.getType(i) == ReadableType.String) {
                            newArr.add(arr.getString(i))
                        }
                    }
                    profile.udpListenIps = newArr
                }
            } else {
                profile.udpListenIps = null
            }
            if (server.hasKey("udpListenPorts")) {
                val arr: ReadableArray? = server.getArray("udpListenPorts")
                if (arr != null) {
                    val newArr: MutableList<Int> = mutableListOf()
                    for (i in 0 until arr.size()) {
                        if (arr.getType(i) == ReadableType.Number) {
                            newArr.add(arr.getInt(i))
                        }
                    }
                    profile.udpListenPorts = newArr
                }
            } else {
                profile.udpListenPorts = null
            }

            // 是否开启udp
            if (server.hasKey("udpRelay")) {
                profile.udpdns = server.getBoolean("udpRelay")
            } else {
                profile.udpdns = false
            }

            if (server.getBoolean("isGost")) {
                profile.remotePort = 1083;
                profile.host = "127.0.0.1";
                profile.gostLocalPort = profile.remotePort;
            }
            profile.gostProtocol = server.getString("gostProtocol");
            profile.gostServerPort = server.getInt("port");
            profile.gostServerIp = server.getString("ip")!!.lowercase();
            profile.label = server.getString("label")

            MainApplication.setCurrentProfile(profile)
            LogUtil.d(TAG, "startVService update currentProfile")

            try {
                promise.resolve(mainActivity.serviceLoad())
            } catch (e: Exception) {
                promise.reject(e)
                LogUtil.e(TAG, "startVService: ${e.stackTraceToString()}")
            }
        }
    }

    @ReactMethod
    fun openSetting(packageName: String?) {
        val intent = Intent()
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        if (Build.VERSION.SDK_INT >= 9) {
            intent.action = "android.settings.APPLICATION_DETAILS_SETTINGS"
            intent.data = Uri.fromParts("package", packageName, null)
        } else if (Build.VERSION.SDK_INT <= 8) {
            intent.action = Intent.ACTION_VIEW
            intent.setClassName("com.android.settings", "com.android.setting.InstalledAppDetails")
            intent.putExtra("com.android.settings.ApplicationPkgName", packageName)
        }
        val context = reactApplicationContext
        context.startActivity(intent)
    }

    @ReactMethod
    fun installApk(path: String, promise: Promise) {
        val cmd = "chmod 777 $path"
        try {
            Runtime.getRuntime().exec(cmd)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        val context = reactApplicationContext

//        try {
//            val intent = Intent(Intent.ACTION_VIEW)
//            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
//            intent.setDataAndType(
//                Uri.parse("file://$path"),
//                "application/vnd.android.package-archive"
//            )
//            context.startActivity(intent)
//        } catch (e: Exception) {
//            e.printStackTrace()
//            promise.resolve(false)
//            promise.reject("error", e.message)
//            return
//        }

        try {
            val intent = Intent(Intent.ACTION_VIEW)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION) // Add this flag to grant read permission to the file
            val uri: Uri
            val file = File(path)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                uri = FileProvider.getUriForFile(context, context.packageName + ".fileprovider", file)
            } else {
                uri = Uri.fromFile(file)
            }
            intent.setDataAndType(uri, "application/vnd.android.package-archive")
            context.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            e.printStackTrace()
            promise.reject("error", e.message)
            return
        }
    }

    /**
     * 查询 DNS A 记录
     */
    @ReactMethod
    fun queryDnsARecord(domain: String?, dnsServers: List<String>, timeout: Int, promise: Promise) {
        try {
            val httpDns = HttpDns(timeout.toLong(), TimeUnit.MILLISECONDS, dnsServers)
            val addresses: List<InetAddress> = httpDns.lookup(domain!!)

            val resultArray: WritableArray = WritableNativeArray()
            for (address in addresses) {
                resultArray.pushString(address.hostAddress)
            }

            promise.resolve(resultArray)
        } catch (e: java.lang.Exception) {
            promise.reject("DNS_LOOKUP_FAILED", e)
        }
    }

    /**
     * 检查NAT类型
     *
     * 1: Open Internet
     * 2: Full-cone NAT
     * 3: Restricted-cone NAT
     * 4: Port-restricted cone NAT
     * 5: Symmetric NAT
     * 6: Symmetric UDP Firewall
     * 7: UDP blocked
     */
    @ReactMethod
    fun checkNATType(stunServer: String?, port: Int, promise: Promise) {
        Thread {
            try {
                val localAddress = InetAddress.getLocalHost()
                val localPort = 0 // 使用随机端口
                val test = DiscoveryTest(localAddress, localPort, stunServer, port)
                val info = test.test()
                val natType = mapNatType(info)
                promise.resolve(natType)
            } catch (e: UtilityException) {
                promise.reject("NAT_TYPE_ERROR", e)
            } catch (e: SocketException) {
                promise.reject("NAT_TYPE_ERROR", e)
            } catch (e: UnknownHostException) {
                promise.reject("NAT_TYPE_ERROR", e)
            } catch (e: IOException) {
                promise.reject("NAT_TYPE_ERROR", e)
            } catch (e: MessageAttributeParsingException) {
                promise.reject("NAT_TYPE_ERROR", e)
            } catch (e: MessageHeaderParsingException) {
                promise.reject("NAT_TYPE_ERROR", e)
            }
        }.start()
    }

    private fun mapNatType(info: DiscoveryInfo): Int {
        return if (info.isOpenAccess) {
            1
        } else if (info.isFullCone) {
            2
        } else if (info.isRestrictedCone) {
            3
        } else if (info.isPortRestrictedCone) {
            4
        } else if (info.isSymmetric) {
            5
        } else if (info.isSymmetricUDPFirewall) {
            6
        } else if (info.isBlockedUDP) {
            7
        } else {
            0 // 未知类型
        }
    }

    @ReactMethod
    fun getDefaultGatewayAddress(promise: Promise) {
        promise.resolve(DxNetworkUtil.getGatewayAddress())
    }

    @RequiresApi(Build.VERSION_CODES.M)
    @ReactMethod
    fun getDefaultDnsServer(promise: Promise) {
        val channel = DxNetworkUtil.getDefaultDnsServer(reactApplicationContext)
        promise.resolve(channel)
    }

    fun sendTrafficUpdate(txRate: Long, rxRate: Long, txTotal: Long, rxTotal: Long) {
        reactApplicationContext
                .getJSModule(RCTDeviceEventEmitter::class.java)
                .emit("TrafficUpdated", createTrafficUpdatePayload(txRate, rxRate, txTotal, rxTotal))
    }

    private fun createTrafficUpdatePayload(txRate: Long, rxRate: Long, txTotal: Long, rxTotal: Long): WritableMap {
        val map = Arguments.createMap()
        map.putDouble("txRate", txRate.toDouble())
        map.putDouble("rxRate", rxRate.toDouble())
        map.putDouble("txTotal", txTotal.toDouble())
        map.putDouble("rxTotal", rxTotal.toDouble())
        return map
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, p3: Intent?) {
        val params = Arguments.createMap()
        params.putString("activity", activity.toString())
        params.putInt("requestCode", requestCode)
        params.putInt("resultCode", resultCode)
        //params.putString("data", data.dataString)
        this.reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java)
            .emit("androidActivityResult", params)
    }

    override fun onNewIntent(intent: Intent) {
        val params = Arguments.createMap()
        params.putString("intent", intent.dataString)
        this.reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java)
            .emit("androidActivityResult", params)
    }

    companion object {
        private const val TAG = "TTManagerModule"
    }
}
