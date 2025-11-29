package com.shadow.ssrclient.service
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.app.Service
import android.content.Intent
import android.net.VpnService
import android.os.Handler
import android.os.IBinder

class ShadowsocksRunnerService : Service() {

    val handler = Handler()

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private val serviceBoundContext = object : ServiceBoundContext(this) {
        override fun onServiceConnected() {
            if (bgService != null) {
                if (VpnService.prepare(this@ShadowsocksRunnerService) == null) {
                    startBackgroundService()
                }
                handler.postDelayed({ stopSelf() }, 10000)
            }
        }

        override fun onServiceDisconnected() {

        }

    }

    fun startBackgroundService() {
        serviceBoundContext.bgService?.useSync(1)
    }

    override fun onCreate() {
        super.onCreate()
        serviceBoundContext.attachService()
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceBoundContext.detachService()
    }
}
