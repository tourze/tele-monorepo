package com.shadow.ssrclient.util

import android.content.Context
import android.content.res.AssetManager
import com.github.shadowsocks.utils.LogUtil
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipInputStream
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

/**
 * ACL 资产自复制与解密逻辑：
 * - Debug 构建：直接复制 assets/acl 下的明文文件；
 * - Release 构建：复制加密打包后的 acl.dat，解密解压到 dataDir。
 */
object AclAssets {
  private const val TAG = "AclAssets"
  private const val PACKED_ASSET_NAME = "acl.dat"
  // 基础密钥（与 build.gradle 中的打包逻辑对应），实际加解密密钥/IV 会基于 salt 派生，保证每次打包二进制不同
  private const val BASE_KEY = "0123456789abcdef"
  private const val SALT_LEN = 16
  private val DEFAULT_ACL_FILES = listOf(
    "bypass-china.acl",
    "bypass-lan-china.acl",
    "bypass-lan.acl",
    "china-list.acl",
    "default-server.acl",
    "gfwlist.acl"
  )

  fun ensureCopied(context: Context) {
    val dataDir = AppUtils.getDataDir()
    if (dataDir.isEmpty()) {
      LogUtil.e(TAG, "dataDir 为空，跳过 ACL 复制")
      return
    }
    val targetDir = File(dataDir)
    if (!targetDir.exists()) targetDir.mkdirs()

    val assets = context.assets
    val expectedFiles = getExpectedFiles(assets)
    val missing = expectedFiles.filter { filename ->
      val f = File(targetDir, filename)
      !f.exists() || f.length() == 0L
    }
    if (missing.isEmpty()) return

    try {
      if (assetExists(assets, PACKED_ASSET_NAME)) {
        copyFromPacked(assets, targetDir)
      } else {
        copyPlainAssets(assets, targetDir)
      }
    } catch (t: Throwable) {
      LogUtil.e(TAG, "复制 ACL 失败: ${t.stackTraceToString()}")
    }
  }

  private fun assetExists(assetManager: AssetManager, name: String): Boolean =
    try {
      assetManager.open(name).close()
      true
    } catch (_: Exception) {
      false
    }

  private fun getExpectedFiles(assetManager: AssetManager): List<String> {
    if (!assetExists(assetManager, PACKED_ASSET_NAME)) {
      val listed = assetManager.list("acl")?.filter { it.endsWith(".acl") } ?: emptyList()
      if (listed.isNotEmpty()) return listed
    }
    return DEFAULT_ACL_FILES
  }

  private fun copyPlainAssets(assetManager: AssetManager, targetDir: File) {
    val files = assetManager.list("acl") ?: emptyArray()
    files.forEach { filename ->
      val outFile = File(targetDir, filename)
      assetManager.open("acl/$filename").use { input ->
        FileOutputStream(outFile).use { output ->
          input.copyTo(output)
        }
      }
    }
    LogUtil.i(TAG, "已复制明文 ACL：${files.joinToString()}")
  }

  private fun copyFromPacked(assetManager: AssetManager, targetDir: File) {
    val packedBytes = assetManager.open(PACKED_ASSET_NAME).use { it.readBytes() }
    if (packedBytes.size <= SALT_LEN) throw IllegalStateException("非法 ACL 包大小")
    val salt = packedBytes.copyOfRange(0, SALT_LEN)
    val cipherBytes = packedBytes.copyOfRange(SALT_LEN, packedBytes.size)

    val keyMaterial = deriveKeyMaterial(salt)
    val secretKey = SecretKeySpec(keyMaterial.first, "AES")
    val ivSpec = IvParameterSpec(keyMaterial.second)
    val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
    cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec)
    val decrypted = cipher.doFinal(cipherBytes)

    ZipInputStream(decrypted.inputStream()).use { zip ->
      var entry = zip.nextEntry
      while (entry != null) {
        if (!entry.isDirectory) {
          val outFile = File(targetDir, entry.name)
          FileOutputStream(outFile).use { output ->
            zip.copyTo(output)
          }
        }
        entry = zip.nextEntry
      }
    }
    LogUtil.i(TAG, "已解密并展开 ACL（加密包）")
  }

  private fun deriveKeyMaterial(salt: ByteArray): Pair<ByteArray, ByteArray> {
    val digest = java.security.MessageDigest.getInstance("SHA-256")
    digest.update(BASE_KEY.toByteArray(Charsets.UTF_8))
    digest.update(salt)
    val full = digest.digest()
    val key = full.copyOfRange(0, 16)
    val iv = full.copyOfRange(16, 32)
    return key to iv
  }
}
