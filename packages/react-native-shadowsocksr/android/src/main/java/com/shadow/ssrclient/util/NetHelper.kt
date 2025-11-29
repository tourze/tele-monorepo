package com.shadow.ssrclient.util
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkInfo
import android.util.Log

/**
 * 检测实时网络状态
 *
 *
 * @author shadow
 */
enum class NetHelper {
    INSTANCE;


    /**
     * 获取当前网络状态
     * @return
     */
    var netStatus: Int = 0
        private set
    private var mContext: Context? = null

    /**
     * 网络是否可用
     * @return
     */
    val netEnabled: Boolean
        get() = netStatus == TYPE_MOBILE || netStatus == TYPE_WIFI

    /**
     * 是否处于移动网络状态
     * @return
     */
    val isMobileStatus: Boolean
        get() = netStatus == TYPE_MOBILE

    fun init(context: Context) {
        mContext = context
        checkNet()
    }

    /**
     * 检测当前网络状态
     */
    fun checkNet() {
        try {
            val connectivity = mContext!!
                .getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            if (connectivity != null) {
                // 获取网络连接管理的对象
                val info = connectivity.activeNetworkInfo
                if (info != null && info.isAvailable) {
                    // 判断当前网络是否已经连接
                    if (info.state == NetworkInfo.State.CONNECTED) {
                        if (info.type == ConnectivityManager.TYPE_WIFI)
                            netStatus = TYPE_WIFI
                        if (info.type == ConnectivityManager.TYPE_MOBILE)
                            netStatus = TYPE_MOBILE
                    }
                } else {
                    netStatus = TYPE_DISCONNECT
                }
            }
        } catch (e: Exception) {
            Log.v("error", e.toString())
            e.printStackTrace()
            netStatus = TYPE_DISCONNECT
        }

    }

    companion object {

        val TYPE_DISCONNECT = 0
        val TYPE_WIFI = 1
        val TYPE_MOBILE = 2
    }
}
