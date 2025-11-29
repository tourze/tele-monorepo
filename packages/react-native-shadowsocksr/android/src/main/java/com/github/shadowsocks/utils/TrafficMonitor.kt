package com.github.shadowsocks.utils
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.icu.text.DecimalFormat
import android.os.Build


object TrafficMonitor {
    // Bytes per second
    var txRate: Long = 0
    var rxRate: Long = 0

    // Bytes for the current session
    var txTotal: Long = 0
    var rxTotal: Long = 0

    // Bytes for the last query
    var txLast: Long = 0
    var rxLast: Long = 0
    var timestampLast: Long = 0

    @Volatile
    var dirty = true

    private val units =
        arrayOf("KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB", "BB", "NB", "DB", "CB")


    private val numberFormat = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
        DecimalFormat("@@@")
    } else {
        java.text.DecimalFormat("@@@")
    }

    fun updateRate(): Boolean {
        val now = System.currentTimeMillis()
        val delta = now - timestampLast
        var updated = false
        if (delta != 0L) {
            if (dirty) {
                txRate = (txTotal - txLast) * 1000 / delta
                rxRate = (rxTotal - rxLast) * 1000 / delta
                txLast = txTotal
                rxLast = rxTotal
                dirty = false
                updated = true
            } else {
                if (txRate != 0L) {
                    txRate = 0
                    updated = true
                }
                if (rxRate != 0L) {
                    rxRate = 0
                    updated = true
                }
            }
            timestampLast = now
        }
        return updated
    }

    fun update(tx: Long, rx: Long) {
        if (txTotal != tx) {
            txTotal = tx
            dirty = true
        }
        if (rxTotal != rx) {
            rxTotal = rx
            dirty = true
        }
    }

    fun reset() {
        txRate = 0
        rxRate = 0
        txTotal = 0
        rxTotal = 0
        txLast = 0
        rxLast = 0
        dirty = true
    }
}
