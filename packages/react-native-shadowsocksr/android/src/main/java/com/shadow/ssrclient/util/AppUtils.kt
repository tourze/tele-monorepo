package com.shadow.ssrclient.util

import android.content.*
import android.provider.Settings
import com.shadow.ssrclient.host.HostBridge
import java.util.*

/**
 * Created on Time: 2019/5/25 22:59:03
 * Copied from Copyright (C) 2017 ThirtyDegreesRay.
 * Modified by Copyright (C) 2019 shadow.
 */
object AppUtils {
    // 已迁移至库模块（react-native-shadowsocksr）
    fun getUniqueID(context: Context): String? {
        var id: String? = null
        val androidId =
            Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
        if (!androidId.isNullOrBlank() && "9774d56d682e549c" != androidId) {
            try {
                val uuid = UUID.nameUUIDFromBytes(androidId.toByteArray(charset("utf8")))
                id = uuid.toString()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
        if (id.isNullOrBlank()) {
            return ""
        }
        return if (id.isNullOrBlank()) UUID.randomUUID().toString() else id
    }

    fun getDataDir(): String = HostBridge.dataDir()
}

