package com.shadow.ssrclient.service
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.VpnService
import android.os.*
import android.system.ErrnoException
import android.text.TextUtils
import android.util.Log
import com.reactnative.IShadowsocksService
import com.reactnative.IShadowsocksServiceCallback
import com.example.ssr.R
import com.shadow.ssrclient.host.HostBridge
import com.github.shadowsocks.utils.*
import com.shadow.ssrclient.database.Profile
import com.shadow.ssrclient.udp.UdpServer
import com.shadow.ssrclient.ui.activity.ShadowsocksRunnerActivity
import com.shadow.ssrclient.util.AclAssets
import com.shadow.ssrclient.util.AppUtils
import com.shadow.ssrclient.util.GuardedProcess
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.net.Socket
import java.net.UnknownHostException
import java.util.*


interface ConnectionCallback {
    fun onConnectionSuccess()
    fun onConnectionError(exc: Exception)
}

class ShadowsocksVpnService : VpnService() {

    companion object {
        val TAG = "ShadowsocksVpnService"
        val VPN_MTU = 1500
        val PRIVATE_VLAN = "26.26.26.%s"
        val PRIVATE_VLAN6 = "fdfe:dcba:9876::%s"

        @Volatile
        private var currentInstance: ShadowsocksVpnService? = null

        @JvmStatic
        fun protectSocket(socket: Socket): Boolean {
            val service = currentInstance ?: return false
            return try {
                service.protect(socket)
            } catch (_: Throwable) {
                false
            }
        }

        @JvmStatic
        fun isVpnActive(): Boolean {
            val service = currentInstance
            return service != null && service.mState != State.STOPPED
        }
    }

    val udpServers: ArrayList<UdpServer> = ArrayList<UdpServer>();
    var conn: ParcelFileDescriptor? = null
    var vpnThread: ShadowsocksVpnThread? = null

    var sslocalProcess: GuardedProcess? = null
    var sstunnelProcess: GuardedProcess? = null
    var pdnsdProcess: GuardedProcess? = null
    var tun2socksProcess: GuardedProcess? = null
    var gostProcess: GuardedProcess? = null
    var proxychains_enable: Boolean = false
    var host_arg = ""
    var dns_address = ""
    var dns_port = 0
    var china_dns_address = ""
    var china_dns_port = 0


    var allApps = HashSet<String>()

    @Volatile
    private var mState = State.STOPPED

    @Volatile
    protected var profile: Profile? = null
    val callbacks = RemoteCallbackList<IShadowsocksServiceCallback>()
    var callbacksCount = 0
    var timer: Timer? = null
    val handler by lazy { Handler(mainLooper) }
    val protectPath by lazy { applicationInfo.dataDir + "/protect_path" }
    var trafficMonitorThread: TrafficMonitorThread? = null


    private val closeReceiver: BroadcastReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            LogUtil.d(TAG, "ShadowsocksVpnService closeReceiver")
            stopRunner(true)
        }
    }
    var closeReceiverRegistered: Boolean = false

    override fun onBind(intent: Intent?): IBinder? {
        val action = intent?.action
        LogUtil.d(TAG, "onBind:$action")
        if (SERVICE_INTERFACE == action) {
            return super.onBind(intent)
        } else if (Action.SERVICE == action) {

            return binder
        }
        return null
    }

    override fun onRevoke() {
        LogUtil.d(TAG, "ShadowsocksVpnService onRevoke")
        stopRunner(true)
    }

    override fun onDestroy() {
        if (currentInstance === this) {
            currentInstance = null
        }
        super.onDestroy()
    }

    val binder: Binder = object : IShadowsocksService.Stub() {
        @Throws(RemoteException::class)
        override fun getState(): Int {
            return mState
        }

        @Throws(RemoteException::class)
        override fun getProfileName(): String? {
            return profile?.name
        }

        @Throws(RemoteException::class)
        override fun registerCallback(cb: IShadowsocksServiceCallback) {
            if (cb != null && callbacks.register(cb)) {
                callbacksCount += 1
                if (callbacksCount != 0 && timer == null) {
                    val task = object : TimerTask() {
                        override fun run() {
                            if (TrafficMonitor.updateRate()) updateTrafficRate()
                        }
                    }
                    timer = Timer(true)
                    timer?.schedule(task, 1000, 1000)
                }
                TrafficMonitor.updateRate()
                cb.trafficUpdated(
                    TrafficMonitor.txRate,
                    TrafficMonitor.rxRate,
                    TrafficMonitor.txTotal,
                    TrafficMonitor.rxTotal
                )
            }
        }

        @Throws(RemoteException::class)
        override fun unregisterCallback(cb: IShadowsocksServiceCallback) {
            if (cb != null && callbacks.unregister(cb)) {
                callbacksCount -= 1
                if (callbacksCount == 0 && timer != null) {
                    timer?.cancel()
                    timer = null
                }
            }
        }

        @Throws(RemoteException::class)
        override fun use(profileId: Int) {
            LogUtil.d(TAG, "ShadowsocksVpnService use id is:$profileId")

            synchronized(this) {
                if (profileId < 0) {
                    stopRunner(true)
                } else {
                    val profile = HostBridge.getCurrentProfile()

                    if (profile == null) {
                        LogUtil.d(TAG, "ShadowsocksVpnService use profile is empty")
                        stopRunner(true)
                    } else {
                        when (mState) {
                            State.STOPPED -> if (checkProfile(profile)) {
                                startRunner(profile)
                            } else {
                            }
                            State.CONNECTED -> {
                                if (profileId != this@ShadowsocksVpnService.profile!!.id.toInt() && checkProfile(
                                        profile
                                    )
                                ) {
                                    stopRunner(false)
                                    startRunner(profile)
                                } else {
                                }
                            }
                            else -> Log.w(
                                ShadowsocksVpnService::class.java.simpleName,
                                "Illegal mState when invoking use: " + mState
                            )
                        }
                    }
                }
            }
        }

        @Throws(RemoteException::class)
        override fun useSync(profileId: Int) {
            use(profileId)
        }

        override fun useProfile(profile: com.reactnative.SSRProfile?) {
            LogUtil.d(TAG, "useProfile called")
            synchronized(this) {
                if (profile == null) {
                    stopRunner(true)
                    return
                }
                // 将 SSRProfile 转换为内部 Profile 并启动
                val p = Profile()
                p.host = (profile.host ?: "").lowercase()
                p.remotePort = profile.remotePort
                p.password = profile.password ?: ""
                p.method = (profile.method ?: "").lowercase()
                p.protocol = (profile.protocol ?: "origin").lowercase()
                p.protocol_param = profile.protocol_param ?: ""
                p.obfs = (profile.obfs ?: "plain").lowercase()
                p.obfs_param = profile.obfs_param ?: ""
                p.route = profile.route ?: Route.DEFAULT_SERVER
                p.udpdns = profile.udpdns
                p.lanOpen = profile.lanOpen
                p.ipv6 = profile.ipv6
                if (!profile.dns.isNullOrEmpty()) {
                    p.dns = profile.dns
                }
                if (!profile.china_dns.isNullOrEmpty()) {
                    p.china_dns = profile.china_dns
                }
                profile.tunAddresses?.let { p.tunAddresses = it }
                profile.tunRoutes?.let { p.tunRoutes = it }
                profile.udpServers?.let { p.udpServers = it }
                profile.udpListenIps?.let { p.udpListenIps = it }
                profile.udpListenPorts?.let { p.udpListenPorts = it }
                profile.allowedApps?.let { p.allowApps = it }
                profile.disallowedApps?.let { p.disallowedApps = it }
                profile.forceProxyHosts?.let { p.forceProxyHosts = it }
                HostBridge.setCurrentProfile(p)

                when (mState) {
                    State.STOPPED -> {
                        if (checkProfile(p)) startRunner(p) else Unit
                    }
                    State.CONNECTED -> {
                        stopRunner(false)
                        if (checkProfile(p)) startRunner(p) else Unit
                    }
                    else -> Log.w(ShadowsocksVpnService::class.java.simpleName, "Illegal mState when useProfile: $mState")
                }
            }
        }
    }

    fun checkProfile(profile: Profile) =
        if (TextUtils.isEmpty(profile.host) || TextUtils.isEmpty(profile.password)) {
            false
        } else true


    fun startRunner(profile: Profile) {
        LogUtil.i(TAG, "start runner: ${profile.host}:${profile.remotePort}")
        // ensure the VPNService is prepared
        if (VpnService.prepare(this) != null) {
            LogUtil.d(TAG, "VpnService.prepare(this) != null")
            val i = Intent(this, ShadowsocksRunnerActivity::class.java)
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            startActivity(i)
            stopRunner(true)
            return
        }
        this.profile = profile
        LogUtil.d(TAG, "start service: ${this.profile?.route} profile")
        startService(Intent(this, ShadowsocksVpnService::class.java))
        TrafficMonitor.reset()
        trafficMonitorThread = TrafficMonitorThread(applicationContext)
        trafficMonitorThread?.start()

        if (!closeReceiverRegistered) {
            // register close receiver
            val filter = IntentFilter()
            filter.addAction(Intent.ACTION_SHUTDOWN)
            filter.addAction(Action.CLOSE)
            if (Build.VERSION.SDK_INT >= 33) {
                registerReceiver(closeReceiver, filter, Context.RECEIVER_EXPORTED)
            } else {
                registerReceiver(closeReceiver, filter)
            }
            closeReceiverRegistered = true
        }

        HostBridge.track(ShadowsocksVpnService::class.java.simpleName, "start")

        changeState(State.CONNECTING)

//        if (profile.isMethodUnsafe) handler.post {
//            Toast.makeText(this, R.string.method_unsafe, Toast.LENGTH_LONG).show()
//        }

        // 创建一个实现 ConnectionCallback 接口的对象
        val connectionCallback = object : ConnectionCallback {
            override fun onConnectionSuccess() {
                // 处理连接成功的逻辑
            }

            override fun onConnectionError(exc: Exception) {
                stopRunner(true, "error" + ": " + exc.message)
                exc.printStackTrace()
                HostBridge.track(exc)
            }
        }

        // 调用 connect() 方法并传递回调参数
        connect(connectionCallback)
    }

    fun stopRunner(stopService: Boolean, msg: String? = null) {
        LogUtil.i(TAG, "stop runner")

        if (vpnThread != null) {
            vpnThread!!.stopThread()
//            vpnThread!!.interrupt()
            vpnThread = null
        }

        HostBridge.track(TAG, "channge the mState")
        changeState(State.STOPPING)

        HostBridge.track(TAG, "reset VPN")
        killProcesses()

        HostBridge.track(TAG, "close connections")
        if (conn != null) {
            conn!!.close()
            conn = null
        }


        // clean up recevier
        if (closeReceiverRegistered) {
            unregisterReceiver(closeReceiver)
            closeReceiverRegistered = false
        }

        // Make sure update total traffic when stopping the runner
        if (TrafficMonitor.txTotal > 0 && TrafficMonitor.rxTotal > 0) {
            updateTrafficTotal(TrafficMonitor.txTotal, TrafficMonitor.rxTotal)
        }

        TrafficMonitor.reset()
        if (trafficMonitorThread != null) {
            trafficMonitorThread!!.stopThread()
            trafficMonitorThread = null
        }

        // change the mState
        changeState(State.STOPPED, msg)

        // stop the service if nothing has bound to it
        if (stopService) stopSelf()

        for (udpServer in udpServers) {
            udpServer.stop()
        }

        profile = null
    }

    protected fun changeState(s: Int, msg: String? = null) {
        val handler = Handler(mainLooper)
        handler.post {
            if (mState != s || msg != null) {
                if (callbacksCount > 0) {
                    val n = callbacks.beginBroadcast()
                    for (i in 0 until n) {
                        try {
                            callbacks.getBroadcastItem(i).stateChanged(s, profile?.name, msg)
                        } catch (_: Exception) {
                            // Ignore
                        }
                    }
                    callbacks.finishBroadcast()
                }
                mState = s
            }
        }
    }

    private fun updateTrafficTotal(tx: Long, rx: Long) {
        val profile = this.profile  // avoid race conditions without locking
        if (profile != null) {
            profile.tx += tx;
            profile.rx += rx;
            HostBridge.setCurrentProfile(profile)
        }
    }

    fun updateTrafficRate() {
        handler.post {
            if (callbacksCount > 0) {
                val txRate = TrafficMonitor.txRate
                val rxRate = TrafficMonitor.rxRate
                val txTotal = TrafficMonitor.txTotal
                val rxTotal = TrafficMonitor.rxTotal
                val n = callbacks.beginBroadcast()
                for (i in 0 until n) {
                    try {
                        callbacks.getBroadcastItem(i)
                            .trafficUpdated(txRate, rxRate, txTotal, rxTotal)
                    } catch (_: Exception) {
                        // Ignore
                    }
                }
                callbacks.finishBroadcast()
            }
        }
    }

    fun connect(callback: ConnectionCallback) {
        proxychains_enable = File(AppUtils.getDataDir() + "/proxychains.conf").exists()

        LogUtil.d(TAG, "proxychains_enable:${proxychains_enable}")//false

        try {
            val dns = profile?.dns?.split(",")?.toList()?.first()
            dns_address = dns?.split(":")?.get(0)!!
            dns_port = dns.split(":").get(1).toInt()
            val china_dns = profile?.dns?.split(",")?.toList()?.first()
            china_dns_address = china_dns?.split(":")?.get(0)!!
            china_dns_port = china_dns.split(":").get(1).toInt()
        } catch (ex: Exception) {
            dns_address = "119.29.29.29"
            dns_port = 53
            china_dns_address = "223.5.5.5"
            china_dns_port = 53

            LogUtil.e(TAG, "connect host error，fallback Tencent/Ali DNS")
        }


        vpnThread = ShadowsocksVpnThread(this)
        vpnThread?.start()

        // reset the context
        killProcesses()

        Thread(object : Runnable {
            override fun run() {
                if (profile == null) {
                    callback.onConnectionError(UnknownHostException("找不到连接Profile"))
                    return
                }

                var maxTries = 3
                while (maxTries > 0) {
                    if (Utils.isIP(profile!!.host)) {
                        break
                    }

                    val addr = Utils.resolve(profile!!.host, enableIPv6 = true)
                    LogUtil.d(TAG, "尝试获取DNS记录 ${profile!!.host} / ${maxTries} / $addr")
                    if (addr != null) {
                        profile!!.host = addr
                    }
                    maxTries--
                }
                if (!Utils.isIP(profile!!.host)) {
                    callback.onConnectionError(UnknownHostException("解析域名时发生错误"))
                    return
                }

                // Resolve the server address
                host_arg = profile!!.host

                try {
                    handleConnection()
                    callback.onConnectionSuccess()
                } catch (ex: Exception) {
                    callback.onConnectionError(ex)
                }
            }
        }).start()

        try {
            Thread.sleep(500)
        } catch (_: Exception) {

        }

        changeState(State.CONNECTED)
    }

    fun handleConnection() {
        LogUtil.d(TAG, "profile udpdns:${profile!!.udpdns}")

        val fd = startVpn()
        if (!sendFd(fd)) {
            throw Exception("sendFd failed")
        }

//        if (profile!!.useGost) {
//            startGostDaemon()
//        }

        startShadowsocksTCPDaemon()

        if (profile!!.udpdns) {
            // 因为在TCP服务那边已经加了 u 参数，所以这里应该不用了
            //startShadowsocksUDPDaemon()
        } else {
            startDnsDaemon()
            startDnsTunnel()
        }
    }


    fun killProcesses() {
        if (sslocalProcess != null) {
            sslocalProcess!!.destroy()
            sslocalProcess = null
        }
        if (sstunnelProcess != null) {
            sstunnelProcess!!.destroy()
            sstunnelProcess = null
        }
        if (tun2socksProcess != null) {
            tun2socksProcess!!.destroy()
            tun2socksProcess = null
        }
        if (pdnsdProcess != null) {
            pdnsdProcess!!.destroy()
            pdnsdProcess = null
        }

        if (gostProcess != null) {
            gostProcess!!.destroy()
            gostProcess = null
        }
    }

    override fun onCreate() {
        super.onCreate()
        currentInstance = this
        AclAssets.ensureCopied(this)
        HostBridge.updateAssets()

//        try {
//            val allAppsList = AppManager.getApps(this.packageManager)
//            for (item in allAppsList) {
//                allApps.add(item.packageName)
//            }
//        } catch (e: Exception) {
//            LogUtil.e(TAG, "获取APP列表失败: ${e.stackTraceToString()}");
//        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return Service.START_NOT_STICKY
    }

    private fun startVpn(): Int {
        LogUtil.d(TAG, "startVpn profile: $profile");

        val builder = Builder()
        profile?.name?.let {
            builder.setSession(it).setMtu(VPN_MTU)
                .addAddress(PRIVATE_VLAN.format(Locale.ENGLISH, "1"), 24)
        }

      var dnsServer = dns_address
      if (profile?.route == Route.CHINALIST) {
        dnsServer = china_dns_address
      }
      LogUtil.d(TAG, "startVpn dnsServer: $dnsServer");
      builder.addDnsServer(dnsServer)

        if (profile?.ipv6 == true) {
            builder.addAddress(PRIVATE_VLAN6.format(Locale.ENGLISH, "1"), 126)
            builder.addRoute("::", 0)
        }

        profile?.allowApps?.filter { !it.isNullOrBlank() }?.forEach {
            try {
                builder.addAllowedApplication(it)
            } catch (ex: Exception) {
                Log.e(TAG, "addAllowedApplication error: $it", ex)
            }
        }

        val disallowed = profile?.disallowedApps?.filter { !it.isNullOrBlank() }?.distinct()
        if (!disallowed.isNullOrEmpty()) {
            disallowed.forEach {
                try {
                    builder.addDisallowedApplication(it)
                } catch (ex: Exception) {
                    Log.e(TAG, "addDisallowedApplication error: $it", ex)
                }
            }
        } else {
            try {
                LogUtil.d(TAG, "$packageName 默认不走VPN流量")
                builder.addDisallowedApplication(packageName)
            } catch (ex: Exception) {
                Log.e(TAG, "addDisallowedApplication default error", ex)
            }
        }

        if (profile?.route == Route.ALL || profile?.route == Route.BYPASS_CHN) {
            builder.addRoute("0.0.0.0", 0)
            LogUtil.d(TAG, "0.0.0.0所有流量都走vpn")
        } else {
            val privateList = resources.getStringArray(R.array.bypass_private_route)
            for (cidr in privateList) {
                val addr = cidr.split('/')
                builder.addRoute(addr.get(0), addr.get(1).toInt())
                LogUtil.d(TAG, "公网IP $cidr 走VPN处理流量")
            }
        }

        if (profile?.route == Route.CHINALIST) {
            builder.addRoute(china_dns_address, 32)
        } else {
            builder.addRoute(dns_address, 32)
        }

        if (profile?.tunAddresses != null && profile?.tunAddresses!!.size > 0) {
            profile!!.tunAddresses.forEach {
                if (!it.isEmpty()) {
                    var split = it.split("/")
                    var ip = split[0]
                    var prefix = split[1].toInt()
                    builder.addAddress(ip, prefix)
                    LogUtil.d(TAG, "TUN网卡自定义address：$ip:$prefix")
                }
            }
        }
        if (profile?.tunRoutes != null && profile?.tunRoutes!!.size > 0) {
            profile!!.tunRoutes.forEach {
                if (!it.isEmpty()) {
                    var split = it.split("/")
                    var ip = split[0]
                    var prefix = split[1].toInt()
                    builder.addRoute(ip, prefix)
                    LogUtil.d(TAG, "TUN网卡自定义route：$ip:$prefix")
                }
            }
        }

        conn = builder.establish()
        if (conn == null) throw NullPointerException("conn is null")

        val fd = conn!!.fd

        val tun2socksPath = File(applicationInfo.nativeLibraryDir, "libtun2socks.so").absolutePath

        val cmd = mutableListOf(
            //AppUtils.getDataDir() + "/tun2socks",
            tun2socksPath,
            "--netif-ipaddr", PRIVATE_VLAN.format(Locale.ENGLISH, "2"),
            "--netif-netmask", "255.255.255.0",
            "--socks-server-addr", "127.0.0.1:" + profile?.localPort,
            //"--tunfd", fd.toString(),
            "--tunmtu", VPN_MTU.toString(),
            "--sock-path", applicationInfo.dataDir + "/sock_path",
            "--loglevel", "debug"
        )

        if (profile!!.ipv6) {
            cmd.addAll(listOf("--netif-ip6addr", PRIVATE_VLAN6.format(Locale.ENGLISH, "2")))
        }

        if (profile!!.udpdns) {
            cmd.add("--enable-udprelay")
        } else {
            cmd.addAll(
                listOf(
                    "--dnsgw", "%s:%d".format(
                        Locale.ENGLISH,
                        PRIVATE_VLAN.format(Locale.ENGLISH, "1"),
                        profile!!.localPort + 53
                    )
                )
            )
        }
        // 调试输出：可按需接入 HostBridge 或构建标记
        Log.d(TAG, cmd.toString())

        // 创建UDP监听服务
        Log.d(TAG, "udpServers: ${profile!!.udpServers}")
        if (profile!!.udpServers != null) {
            // 启动一个新的线程来处理UDP监听服务的启动
            Thread {
                var retryCount = 0
                val maxRetries = 10

                // 检查端口1080是否在监听
                while (!isPortListening("127.0.0.1", 1080) && retryCount < maxRetries) {
                    Log.d(TAG, "1 - 等待端口1080开始监听...")
                    Thread.sleep(1000) // 等待1秒后再重试
                    retryCount++
                }

                if (isPortListening("127.0.0.1", 1080)) {
                    Log.d(TAG, "1 - 端口1080已开始监听")

                    profile!!.udpServers.forEach { ip ->
                        val udpServer = UdpServer(ip)
                        udpServers.add(udpServer)
                        udpServer.start()
                    }
                } else {
                    Log.d(TAG, "1 - 端口1080在重试${maxRetries}次后仍未开始监听，放弃")
                }
            }.start()
        } else {
            Log.d(TAG, "1 - 找不到任何UDP监听配置")
        }

        // 创建UDP监听服务
        Log.d(TAG, "udpListenIps: ${profile!!.udpListenIps}")
        Log.d(TAG, "udpListenPorts: ${profile!!.udpListenPorts}")
        if (profile!!.udpListenIps != null && !profile!!.udpListenIps.isEmpty()) {
            // 启动一个新的线程来处理UDP监听服务的启动
            Thread {
                Log.d(TAG, "udpListenIps: ${profile!!.udpListenIps}")
                Log.d(TAG, "udpListenPorts: ${profile!!.udpListenPorts}")
                if (profile!!.udpListenIps != null) {
                    var retryCount = 0
                    val maxRetries = 10

                    // 检查端口1080是否在监听
                    while (!isPortListening("127.0.0.1", 1080) && retryCount < maxRetries) {
                        Log.d(TAG, "2 - 等待端口1080开始监听...")
                        Thread.sleep(1000) // 等待1秒后再重试
                        retryCount++
                    }

                    if (isPortListening("127.0.0.1", 1080)) {
                        Log.d(TAG, "2 - 端口1080已开始监听")

                        profile!!.udpListenIps.forEach { ip ->
                            profile!!.udpListenPorts.forEach { port ->
                                val udpServer = UdpServer(ip, port)
                                udpServers.add(udpServer)
                                udpServer.start()
                            }
                        }
                    } else {
                        Log.d(TAG, "2 - 端口1080在重试${maxRetries}次后仍未开始监听，放弃")
                    }
                } else {
                    Log.d(TAG, "2 - 找不到任何UDP监听配置")
                }
            }.start()
        } else {
            Log.d(TAG, "2 - 找不到任何UDP监听配置")
        }

        tun2socksProcess = GuardedProcess(cmd).start {
            sendFd(fd)
        }

        return fd
    }

    // 定义一个方法来检查端口是否在监听
    fun isPortListening(host: String, port: Int): Boolean {
        return try {
            Socket(host, port).use { socket -> true }
        } catch (e: IOException) {
            false
        }
    }

    private fun sendFd(fd: Int): Boolean {
        if (fd != -1) {
            var tries = 1L
            while (tries < 5) {
                Thread.sleep(1000 * tries)
                if (com.github.shadowsocks.System.sendfd(
                        fd, applicationInfo.dataDir + "/sock_path"
                    ) != -1
                ) {
                    return true
                }
                tries += 1
            }
        }
        return false
    }

//    private fun startGostDaemon() {
//        val gostPath = File(applicationInfo.nativeLibraryDir, "libgost.so").absolutePath
//
//        var f_text =
//            "${profile?.gostProtocol}://${profile?.gostServerIp}:${profile?.gostServerPort}"
//        if (!(profile?.loadNodes.isNullOrBlank() || profile?.loadNodes.equals("None"))) {
//            f_text = "${profile?.gostProtocol}://?ip=${profile?.loadNodes}"
//        }
//
//        val cmd = mutableListOf(
//            gostPath, "-L", "tcp://:${profile?.gostLocalPort}", "-F", f_text
//        )
//
//        LogUtil.i(TAG, "Gost cmd：$cmd")
//
//        gostProcess = GuardedProcess(cmd).start()
//    }

    private fun startShadowsocksTCPDaemon() {
        var conf = ConfigUtils.SHADOWSOCKS.format(
                Locale.ENGLISH,
                profile?.host,
                profile?.remotePort,
                profile?.localPort,
                ConfigUtils.EscapedJson(profile!!.password),
                profile?.userId,
                ConfigUtils.EscapedJson(profile!!.userPass),
                profile?.method,
                600,
                profile?.protocol,
                profile?.obfs,
                ConfigUtils.EscapedJson(profile!!.obfs_param),
                ConfigUtils.EscapedJson(profile!!.protocol_param)
        );

        LogUtil.i(TAG, "cmd conf ss-local-vpn.conf:$conf")

        Utils.printToFile(AppUtils.getDataDir() + "/ss-local-vpn.conf", conf)

        val sslocalPath = File(applicationInfo.nativeLibraryDir, "libss-local.so").absolutePath

        var bindAddr = "127.0.0.1";
        if (profile!!.lanOpen) {
            bindAddr = "0.0.0.0";
        }

        val cmd = mutableListOf(
            sslocalPath,
            "-v",
            "-V",
            "-x",
            "-b",
            bindAddr,
            "-t",
            "600",
            "--host",
            host_arg,
            "-P",
            AppUtils.getDataDir(),
            "-c",
            AppUtils.getDataDir() + "/ss-local-vpn.conf"
        )

        if (profile!!.udpdns) cmd += "-u"

        if (profile!!.route != Route.ALL) {
            val baseAclPath = AppUtils.getDataDir() + '/' + profile!!.route + ".acl"
            LogUtil.i(TAG, "aclFile: $baseAclPath")

            val baseFile = File(baseAclPath)
            if (!baseFile.exists()) {
                LogUtil.e(TAG, "aclFile文件不存在")
            } else {
                val effectiveAcl = buildAclWithForceHosts(baseFile, profile!!.forceProxyHosts)
                if (!effectiveAcl.isNullOrEmpty()) {
                    cmd += "--acl"
                    cmd += effectiveAcl
                }
            }
        }

        // 参考 https://ssrvps.org/archives/6410 暂时屏蔽了
        // https://github.com/shadowsocks/shadowsocks-libev/issues/1669
//        if (TcpFastOpen.sendEnabled()) cmd += "--fast-open"

        if (proxychains_enable) {
            cmd.add(0, "LD_PRELOAD=" + AppUtils.getDataDir() + "/lib/libproxychains4.so")
            cmd.add(0, "PROXYCHAINS_CONF_FILE=" + AppUtils.getDataDir() + "/proxychains.conf")
            cmd.add(0, "PROXYCHAINS_PROTECT_FD_PREFIX=" + AppUtils.getDataDir())
            cmd.add(0, "env")
        }

        //LogUtil.i(TAG, "startShadowsocksDaemon最后执行: $cmd")

        sslocalProcess = GuardedProcess(cmd).start()
    }

    private fun buildAclWithForceHosts(baseFile: File, forceHosts: List<String>?): String? {
        val hosts = forceHosts?.map { it.trim() }?.filter { it.isNotEmpty() } ?: emptyList()
        if (hosts.isEmpty()) return baseFile.absolutePath
        return try {
            val marker = "[proxy_list]"
            val injection = buildString {
                appendLine()
                appendLine("# force proxy hosts")
                hosts.forEach { appendLine(it) }
            }
            val baseContent = baseFile.readText()
            val newContent = if (baseContent.contains(marker)) {
                baseContent.replaceFirst(marker, marker + injection)
            } else {
                buildString {
                    append(baseContent)
                    if (!baseContent.endsWith("\n")) appendLine()
                    append("[proxy_list]")
                    append(injection)
                }
            }
            val customName = "custom-${profile?.route ?: "acl"}.acl"
            val customFile = File(AppUtils.getDataDir(), customName)
            customFile.writeText(newContent)
            customFile.absolutePath
        } catch (e: IOException) {
            LogUtil.e(TAG, "生成自定义ACL失败: ${e.stackTraceToString()}")
            baseFile.absolutePath
        }
    }

    private fun startShadowsocksUDPDaemon() {
        var conf = ConfigUtils.SHADOWSOCKS.format(
                Locale.ENGLISH,
                profile?.host,
                profile?.remotePort,
                profile?.localPort,
                ConfigUtils.EscapedJson(profile!!.password),
                profile?.userId,
                ConfigUtils.EscapedJson(profile!!.userPass),
                profile?.method,
                600,
                profile?.protocol,
                profile?.obfs,
                ConfigUtils.EscapedJson(profile!!.obfs_param),
                ConfigUtils.EscapedJson(profile!!.protocol_param)
        );

//        LogUtil.d(TAG, "cmd conf ss-local-udp-vpn.conf:$conf")
        Utils.printToFile(AppUtils.getDataDir() + "/ss-local-udp-vpn.conf", conf)

        val sslocalPath = File(applicationInfo.nativeLibraryDir, "libss-local.so").absolutePath
        var cmd = mutableListOf(
            sslocalPath,
            "-v",
            "-V",
            "-U",
            "-b",
            "127.0.0.1",
            "-t",
            "600",
            "--host",
            host_arg,
            "-P",
            AppUtils.getDataDir(),
            "-c",
            AppUtils.getDataDir() + "/ss-local-udp-vpn.conf"
        )

        if (proxychains_enable) {
            cmd.add(0, "LD_PRELOAD=" + AppUtils.getDataDir() + "/lib/libproxychains4.so")
            cmd.add(0, "PROXYCHAINS_CONF_FILE=" + AppUtils.getDataDir() + "/proxychains.conf")
            cmd.add(0, "PROXYCHAINS_PROTECT_FD_PREFIX=" + AppUtils.getDataDir())
            cmd.add(0, "env")
        }

        LogUtil.i(TAG, cmd.toString())

        sstunnelProcess = GuardedProcess(cmd).start()
    }

    private fun startDnsTunnel() {
        var conf = ConfigUtils.SHADOWSOCKS.format(
                Locale.ENGLISH,
                profile!!.host,
                profile!!.remotePort,
                profile!!.localPort + 63,
                ConfigUtils.EscapedJson(profile!!.password),
                profile!!.userId,
                ConfigUtils.EscapedJson(profile!!.userPass),
                profile!!.method,
                600,
                profile!!.protocol,
                profile!!.obfs,
                ConfigUtils.EscapedJson(profile!!.obfs_param),
                ConfigUtils.EscapedJson(profile!!.protocol_param)
        );
        Utils.printToFile(AppUtils.getDataDir() + "/ss-tunnel-vpn.conf", conf)

//        LogUtil.d(TAG, "cmd conf ss-tunnel-vpn.conf:$conf")

        //val old_ld = Os.getenv("LD_PRELOAD")

        //Os.setenv("LD_PRELOAD", getAppUtils.getDataDir() + "/lib/libproxychains4.so", true)
        //Os.setenv("PROXYCHAINS_CONF_FILE", getAppUtils.getDataDir() + "/proxychains.conf", true)


        val sslocalPath = File(applicationInfo.nativeLibraryDir, "libss-local.so").absolutePath
        val cmd = mutableListOf(
            sslocalPath,
            "-V",
            "-u",
            "-t",
            "60",
            "--host",
            host_arg,
            "-b",
            "127.0.0.1",
            "-P",
            AppUtils.getDataDir(),
            "-c",
            AppUtils.getDataDir() + "/ss-tunnel-vpn.conf"
        )

        cmd += "-L"
        if (profile!!.route == Route.CHINALIST) cmd += "$china_dns_address:$china_dns_port"
        else cmd += "$dns_address:$dns_port"

        if (proxychains_enable) {
            cmd.add(0, "LD_PRELOAD=" + AppUtils.getDataDir() + "/lib/libproxychains4.so")
            cmd.add(0, "PROXYCHAINS_CONF_FILE=" + AppUtils.getDataDir() + "/proxychains.conf")
            cmd.add(0, "PROXYCHAINS_PROTECT_FD_PREFIX=" + AppUtils.getDataDir())
            cmd.add(0, "env")
        }

        LogUtil.i(TAG, cmd.toString())

        sstunnelProcess = GuardedProcess(cmd).start()

        //Os.setenv("LD_PRELOAD", old_ld, true)
    }

    private fun startDnsDaemon() {
        val reject = if (profile!!.ipv6) "224.0.0.0/3" else "224.0.0.0/3, ::/0"
        val protect = "protect = \"$protectPath\";"

        var china_dns_settings = ""

        var remote_dns = false

        if (profile!!.route == Route.ACL) {
            //decide acl route
            val inputStream: InputStream =
                File(AppUtils.getDataDir() + '/' + profile!!.route + ".acl").inputStream()

            inputStream.bufferedReader().useLines { lines ->
                lines.forEach {
                    if (it.equals("[remote_dns]")) {
                        remote_dns = true
                    }
                }
            }
        }

        val black_list = when (profile!!.route) {
            Route.BYPASS_CHN, Route.BYPASS_LAN_CHN, Route.DEFAULT_SERVER, Route.GFWLIST -> {
                getBlackList()
            }
            Route.ACL -> {
                if (remote_dns) {
                    ""
                } else {
                    getBlackList()
                }
            }
            else -> ""
        }

        for (china_dns in profile!!.china_dns.split(",")) {
            china_dns_settings += ConfigUtils.REMOTE_SERVER.format(
                Locale.ENGLISH,
                china_dns.split(":").get(0),
                china_dns.split(":").get(1).toInt(),
                black_list,
                reject
            )
        }

        val conf = when (profile!!.route) {
            Route.BYPASS_CHN, Route.BYPASS_LAN_CHN, Route.DEFAULT_SERVER, Route.GFWLIST -> {
                ConfigUtils.PDNSD_DIRECT.format(
                    Locale.ENGLISH,
                    protect,
                    AppUtils.getDataDir(),
                    "0.0.0.0",
                    profile!!.localPort + 53,
                    china_dns_settings,
                    profile!!.localPort + 63,
                    reject
                )
            }
            Route.CHINALIST -> {
                ConfigUtils.PDNSD_DIRECT.format(
                    Locale.ENGLISH,
                    protect,
                    AppUtils.getDataDir(),
                    "0.0.0.0",
                    profile!!.localPort + 53,
                    china_dns_settings,
                    profile!!.localPort + 63,
                    reject
                )
            }
            Route.ACL -> {
                if (!remote_dns) {
                    ConfigUtils.PDNSD_DIRECT.format(
                        Locale.ENGLISH,
                        protect,
                        AppUtils.getDataDir(),
                        "0.0.0.0",
                        profile!!.localPort + 53,
                        china_dns_settings,
                        profile!!.localPort + 63,
                        reject
                    )
                } else {
                    ConfigUtils.PDNSD_LOCAL.format(
                        Locale.ENGLISH,
                        protect,
                        AppUtils.getDataDir(),
                        "0.0.0.0",
                        profile!!.localPort + 53,
                        profile!!.localPort + 63,
                        reject
                    )
                }
            }
            else -> {
                ConfigUtils.PDNSD_LOCAL.format(
                    Locale.ENGLISH,
                    protect,
                    AppUtils.getDataDir(),
                    "0.0.0.0",
                    profile!!.localPort + 53,
                    profile!!.localPort + 63,
                    reject
                )
            }
        }
//        LogUtil.d(TAG, "cmd conf pdnsd-vpn.conf:$conf")

        val pdnsdPath = File(applicationInfo.nativeLibraryDir, "libpdnsd.so").absolutePath
        Utils.printToFile(AppUtils.getDataDir() + "/pdnsd-vpn.conf", conf)
        val cmd = listOf(pdnsdPath, "-c", AppUtils.getDataDir() + "/pdnsd-vpn.conf")

      val properties: MutableMap<String, String> = HashMap()
      properties["exe"] = pdnsdPath
      properties["configFile"] = AppUtils.getDataDir() + "/pdnsd-vpn.conf"
      LogUtil.i(TAG, properties)

        pdnsdProcess = GuardedProcess(cmd).start()
    }

    private fun getBlackList(): String {
        val default = getString(R.string.black_list)
        return "exclude = $default;"
    }
}
