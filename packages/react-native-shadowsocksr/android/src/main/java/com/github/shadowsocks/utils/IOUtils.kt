package com.github.shadowsocks.utils
// 文件已迁移至库模块（react-native-shadowsocksr）

import java.io.FileWriter
import java.io.InputStream
import java.io.OutputStream

object IOUtils {
    private val BUFFER_SIZE = 32 * 1024

    fun copy(input: InputStream, output: OutputStream) {
        val buffer = ByteArray(BUFFER_SIZE)
        while (true) {
            val count = input.read(buffer)
            if (count >= 0) output.write(buffer, 0, count) else return
        }
    }

    fun readString(input: InputStream): String {
        val builder = StringBuilder()
        val buffer = ByteArray(BUFFER_SIZE)
        while (true) {
            val count = input.read(buffer)
            if (count >= 0) builder.append(String(buffer, 0, count)) else return builder.toString()
        }
        null
    }

    fun writeString(file: String, content: String) {
        val writer = FileWriter(file)
        writer.write(content)
        writer.close()
    }

}

