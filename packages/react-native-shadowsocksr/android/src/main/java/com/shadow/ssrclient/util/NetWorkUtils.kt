package com.shadow.ssrclient.util
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.content.Context
import android.net.wifi.WifiManager

class NetWorkUtils {
    var isCompatCheckApOpen: Boolean = false

    /**
     * 判断是否开启热点
     */
    fun isHotSpotApOpen(context: Context): Boolean {
        var z = false
        try {
            val wifiManager = context.getSystemService(Context.WIFI_SERVICE) as WifiManager
            if ((wifiManager.javaClass.getDeclaredMethod("getWifiApState", *arrayOfNulls(0)).invoke(wifiManager, *arrayOfNulls(0)) as Int) == (wifiManager.javaClass.getDeclaredField("WIFI_AP_STATE_ENABLED")[wifiManager] as Int)) {
                z = true
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        if (z || !isCompatCheckApOpen) {
            return z
        }
        return true
    }
}
