package com.github.shadowsocks.utils
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.content.Context
import android.net.LocalServerSocket
import android.net.LocalSocket
import android.net.LocalSocketAddress
import android.util.Log
import java.io.File
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.util.concurrent.Executors

class TrafficMonitorThread(context: Context) : Thread() {


    val TAG = "TrafficMonitorThread"
    val PATH = context.applicationInfo.dataDir + "/stat_path"

    val localSocket = LocalSocket()

    @Volatile
    var serverSocket: LocalServerSocket? = null

    @Volatile
    var isRunning: Boolean = true

    private fun closeServerSocket() {
        if (serverSocket != null) {
            try {
                serverSocket?.close()
            } catch (_: Exception) {

            }
            serverSocket = null
        }
    }

    fun stopThread() {
        isRunning = false
        closeServerSocket()
        localSocket.close()
    }

    override fun run() {
        File(PATH).delete()

        try {
            localSocket.bind(LocalSocketAddress(PATH, LocalSocketAddress.Namespace.FILESYSTEM))
            serverSocket = LocalServerSocket(localSocket.fileDescriptor)
        } catch (e: IOException) {
            e.printStackTrace()
            Log.e(TAG, "unable to bind", e)
            return
        }

        val pool = Executors.newFixedThreadPool(1)

        while (isRunning) {
            try {
                val socket = serverSocket?.accept()

                pool.execute {
                    try {
                        val input = socket?.inputStream
                        val output = socket?.outputStream

                        val buffer = ByteArray(16)
                        if (input?.read(buffer) != 16) throw  IOException("Unexpected traffic stat length")
                        val stat = ByteBuffer.wrap(buffer).order(ByteOrder.LITTLE_ENDIAN)
                        TrafficMonitor.update(stat.getLong(0), stat.getLong(8))

                        output?.write(0)

                        input.close()
                        output?.close()
                    } catch (e: Exception) {
                        e.printStackTrace()
                        Log.e(TAG, "Error when recv traffic stat", e)
                    }

                    // close socket
                    try {
                        socket?.close()
                    } catch (_: Exception) {
                    }
                }
            } catch (e: IOException) {
                Log.e(TAG, "Error when accept socket", e)
                e.printStackTrace()
                return
            }
        }
    }
}
