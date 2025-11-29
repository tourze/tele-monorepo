package com.shadow.ssrclient.dns;

import com.facebook.react.modules.network.OkHttpClientFactory;
import com.facebook.react.modules.network.OkHttpClientProvider;

import java.net.Proxy;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;

public class CustomClientFactory implements OkHttpClientFactory {
    private static final Object DNS_TIMEOUT = 5L;

    @Override
    public OkHttpClient createNewNetworkModuleClient() {
        List<String> customDnsServers = Arrays.asList(
                // 腾讯DNSPod
                "119.29.29.29",

                // 阿里
                "223.5.5.5",
                "223.6.6.6",
                // "https://dns.alidns.com/dns-query",

                // 百度
                "180.76.76.76",

                // 微软
                "4.2.2.1",
                "4.2.2.2",

                // 其他
                "114.114.114.114"
        );

        return OkHttpClientProvider.createClientBuilder()
                .dns(new HttpDns((Long) DNS_TIMEOUT, TimeUnit.MILLISECONDS, customDnsServers))
                .proxy(Proxy.NO_PROXY) // 对于我们app内发起的请求，我们不应该再走一次系统代理，那样子容易被人抓包拿来分析
                .build();
    }
}
