package com.shadow.ssrclient.dns

import android.os.Build
import com.github.shadowsocks.utils.LogUtil
import com.qiniu.android.dns.DnsManager
import com.qiniu.android.dns.NetworkInfo
import com.qiniu.android.dns.dns.DnsUdpResolver
import com.qiniu.android.dns.dns.DohResolver
import okhttp3.Dns
import java.net.InetAddress
import java.net.UnknownHostException
import java.util.concurrent.Callable
import java.util.concurrent.CompletableFuture
import java.util.concurrent.FutureTask
import java.util.concurrent.TimeUnit

/**
 * author ：Peakmain
 * createTime：2023/06/15
 * mail:2726449200@qq.com
 * describe：
 */
class HttpDns constructor(
        val timeout: Long,
        val unit: TimeUnit,
        customDnsServers: List<String>?
) : Dns {
    private val TAG = "HttpDns"
    private val mDnsManager: DnsManager

    init {
        val defaultResolvers = arrayOf(
                // 腾讯DNSPod
                DnsUdpResolver("119.29.29.29"),
                // 阿里
                DnsUdpResolver("223.5.5.5"),
                DnsUdpResolver("223.6.6.6"),
                // 百度
                DnsUdpResolver("180.76.76.76"),
                // 微软
                DnsUdpResolver("4.2.2.1"),
                DnsUdpResolver("4.2.2.2"),
                // DohResolver("https://dns.alidns.com/dns-query"),
                // 没办法只能继续用垃圾114了
                DnsUdpResolver("114.114.114.114"),
        )

        val resolvers = customDnsServers?.map {
            if (it.startsWith("https://")) {
                DohResolver(it)
            } else {
                DnsUdpResolver(it)
            }
        }?.toTypedArray() ?: defaultResolvers

        mDnsManager = DnsManager(NetworkInfo.normal, resolvers)
    }

    override fun lookup(hostname: String): MutableList<InetAddress> {
        val future = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            CompletableFuture.supplyAsync {
                val ips = mDnsManager.queryRecords(hostname)
                if (ips == null || ips.isEmpty()) return@supplyAsync Dns.SYSTEM.lookup(hostname)
                val result = ArrayList<InetAddress>()
                for (record in ips) {
                    if (!record.isA) {
                        LogUtil.d(TAG, "自定义DNS[$hostname]跳过非A记录：${record.value}")
                        continue
                    }
                    LogUtil.d(TAG, "自定义DNS[$hostname]解析结果：${record.value}")
                    try {
                        result.add(InetAddress.getByName(record.value))
                    } catch (e: UnknownHostException) {
                        e.printStackTrace()
                    }
                }
                return@supplyAsync result
            }
        } else {
            FutureTask(object : Callable<List<InetAddress>> {
                override fun call(): List<InetAddress> {
                    val ips = mDnsManager.queryRecords(hostname)
                    if (ips == null || ips.isEmpty()) return Dns.SYSTEM.lookup(hostname)
                    val result = ArrayList<InetAddress>()
                    for (record in ips) {
                        if (!record.isA) {
                            LogUtil.d(TAG, "自定义DNS[$hostname]跳过非A记录：${record.value}")
                            continue
                        }
                        LogUtil.d(TAG, "自定义DNS[$hostname]解析结果：${record.value}")
                        try {
                            result.add(InetAddress.getByName(record.value))
                        } catch (e: UnknownHostException) {
                            e.printStackTrace()
                        }
                    }
                    return result
                }
            })
        }
        return try {
            future.get(timeout, unit).toMutableList()
        } catch (e: Exception) {
            Dns.SYSTEM.lookup(hostname).toMutableList()
        }
    }
}
