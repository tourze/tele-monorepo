package com.shadow.ssrclient.service
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.os.RemoteException
import com.shadow.ssrclient.host.HostBridge
import com.reactnative.IShadowsocksService
import com.reactnative.IShadowsocksServiceCallback
import com.github.shadowsocks.utils.Action
import com.github.shadowsocks.utils.LogUtil

abstract class ServiceBoundContext(val context: Context) : IBinder.DeathRecipient {
    override fun binderDied() {
        LogUtil.d("ServiceBoundContext", "binderDied")
        detachService()
        HostBridge.crashRecovery()
        attachService(callback)
    }

    private var callback: IShadowsocksServiceCallback.Stub? = null
    private var connection: ShadowsocksServiceConnection? = null
    private var callbackRegistered: Boolean = false

    // Variables
    var binder: IBinder? = null
    var bgService: IShadowsocksService? = null


    fun attachService(callback: IShadowsocksServiceCallback.Stub? = null) {
        LogUtil.d("ServiceBoundContext", "attachService")
        this.callback = callback
        if (bgService == null) {
            val s = ShadowsocksVpnService::class.java
            val intent = Intent(context, s)
            intent.action = Action.SERVICE
            connection = ShadowsocksServiceConnection()
            context.bindService(intent, connection!!, Context.BIND_AUTO_CREATE)
        }
    }

    fun detachService() {
        LogUtil.d("ServiceBoundContext", "detachService")
        unregisterCallback()
        callback = null
        if (connection != null) {
            try {
                context.unbindService(connection!!)
            } catch (_: IllegalArgumentException) {
                // ignore
            }
        }
        connection = null

        if (binder != null) {
            binder!!.unlinkToDeath(this, 0)
            binder = null
        }
        bgService = null
    }

    protected fun registerCallback() {
        if (bgService != null && callback != null && !callbackRegistered) try {
            bgService!!.registerCallback(callback)
            callbackRegistered = true
        } catch (_: RemoteException) {
        }
    }

    protected fun unregisterCallback() {
        if (bgService != null && callback != null && callbackRegistered)
            try {
                bgService!!.unregisterCallback(callback)
            } catch (_: RemoteException) {
            }

        callbackRegistered = false
    }

    internal inner class ShadowsocksServiceConnection : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            LogUtil.d("ServiceBoundContext", "onServiceConnected")
            binder = service
            service.linkToDeath(this@ServiceBoundContext, 0)
            bgService = IShadowsocksService.Stub.asInterface(service)
            registerCallback()
            this@ServiceBoundContext.onServiceConnected()
        }

        override fun onServiceDisconnected(name: ComponentName) {
            LogUtil.d("ServiceBoundContext", "onServiceDisconnected")
            unregisterCallback()
            this@ServiceBoundContext.onServiceDisconnected()
            bgService = null
            binder = null
        }
    }

    abstract fun onServiceConnected()
    abstract fun onServiceDisconnected()

}
