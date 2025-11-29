package com.github.shadowsocks.utils
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.util.Log

object LogUtil {

    private const val debug = true

    fun d(TAG: String, msg: String) {
        if (debug) {
            Log.d(TAG, "${Thread.currentThread().id} ssr-debug: $msg")
        }
    }

    fun i(TAG: String, msg: String) {
        var _msg = "${Thread.currentThread().id} - $msg"
        Log.i(TAG, _msg)
    }

  fun i(TAG: String, properties: MutableMap<String, String>) {
    properties["currentThreadId"] = "${Thread.currentThread().id}"
    Log.i(TAG, properties.toString())
  }

    fun e(TAG: String, msg: String) {
      var _msg = "${Thread.currentThread().id} - $msg"
      Log.e(TAG, _msg)
    }
}
