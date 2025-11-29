package com.shadow.ssrclient.ui.activity

import android.annotation.SuppressLint
import android.app.Activity
import android.app.KeyguardManager
import android.content.*
import android.net.VpnService
import android.os.Build
import android.os.Bundle
import android.os.Handler
import com.github.shadowsocks.utils.LogUtil
import com.shadow.ssrclient.service.ServiceBoundContext

// 迁移自应用模块：用于触发 VpnService.prepare 授权并在授权后启动服务
class ShadowsocksRunnerActivity : Activity() {

    private val handler = Handler()
    private var receiver: BroadcastReceiver? = null

    companion object {
        private const val TAG = "ShadowsocksRunnerActivity"
        private const val REQUEST_CONNECT = 1
    }

    private val serviceBoundContext = object : ServiceBoundContext(this) {
        override fun onServiceConnected() {
            LogUtil.d(TAG, "onServiceConnected")
            handler.postDelayed({
                if (bgService != null) startBackgroundService()
            }, 500)
        }
        override fun onServiceDisconnected() { }
    }

    private fun startBackgroundService() {
        LogUtil.d(TAG, "startBackgroundService")
        val intent = VpnService.prepare(this@ShadowsocksRunnerActivity)
        if (intent != null) {
            startActivityForResult(intent, REQUEST_CONNECT)
        } else {
            onActivityResult(REQUEST_CONNECT, Activity.RESULT_OK, null)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val km = getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        val locked = km.isKeyguardLocked
        if (locked) {
            val filter = IntentFilter(Intent.ACTION_USER_PRESENT)
            receiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    if (intent?.action == Intent.ACTION_USER_PRESENT) {
                        serviceBoundContext.attachService()
                    }
                }
            }
            if (Build.VERSION.SDK_INT >= 33) {
                registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
            } else {
                registerReceiver(receiver, filter)
            }
        } else {
            serviceBoundContext.attachService()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceBoundContext.detachService()
        receiver?.let {
            unregisterReceiver(it)
            receiver = null
        }
    }

    @SuppressLint("LongLogTag")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        when (resultCode) {
            Activity.RESULT_OK -> {
                LogUtil.d(TAG, "onActivityResult")
                serviceBoundContext.bgService?.use(1)
            }
            else -> { /* 忽略 */ }
        }
        finish()
    }
}

