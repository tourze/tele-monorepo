package com.shadow.ssrclient.service
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.net.LocalServerSocket
import android.net.LocalSocket
import android.net.LocalSocketAddress
import android.util.Log
import com.shadow.ssrclient.host.HostBridge
import java.io.File
import java.io.FileDescriptor
import java.io.IOException
import java.util.concurrent.Executors

class ShadowsocksVpnThread(val vpnService: ShadowsocksVpnService) : Thread() {

    val TAG = "ShadowsocksVpnService"

    val PATH = (HostBridge.dataDir()) + "/protect_path"

    @Volatile
    var isRunning: Boolean = true

    @Volatile
    var serverSocket: LocalServerSocket? = null
    val localSocket = LocalSocket()

    private fun closeServerSocket() {
        if (serverSocket != null) {
            try {
                serverSocket?.close()
            } catch (_: Exception) {
                // ignore
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
            Log.e(TAG, "unable to bind", e)
            HostBridge.track(e)
            return
        }

        val pool = Executors.newFixedThreadPool(4)

        while (isRunning) {
            try {
                val socket = serverSocket?.accept()

                pool.execute {
                    try {
                        val input = socket?.inputStream
                        val output = socket?.outputStream

                        input?.read()

                        val fds = socket?.ancillaryFileDescriptors

                        if (!fds.isNullOrEmpty()) {
                            val fd = FileDescriptor::class.java.getDeclaredMethod("getInt$")
                                .invoke(fds.get(0)) as Int
                        val ret = vpnService.protect(fd)

                        // Trick to close file decriptor
                        com.github.shadowsocks.System.jniclose(fd)

                        if (ret) {
                            Log.d(TAG, "protect fd $fd success")
                            output?.write(0)
                        } else {
                            Log.e(TAG, "protect fd $fd failed")
                            output?.write(1)
                        }
                        }

                        input?.close()
                        output?.close()

                    } catch (e: Exception) {
                        Log.e(TAG, "Error when protect socket", e)
                        HostBridge.track(e)
                    }

                    // close socket
                    try {
                        socket?.close()
                    } catch (_: Exception) {
                        // ignore
                    }

                }
            } catch (e: IOException) {
                Log.e(TAG, "Error when accept socket", e)
                HostBridge.track(e)
                return
            }
        }
    }

}
