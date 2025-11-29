/**
 * 参考 https://github.com/7Sageer/sublink-worker/blob/d152fb197b284096c03d4ee0295efd8e1b2071b6/src/config.js#L296
 */
async function getSmartDns() {
  return {
    servers: [
      // 国外统一用 1.1.1.1
      {
        tag: 'dns_proxy',
        address: 'tls://1.1.1.1',
        address_resolver: 'dns_resolver',
        detour: 'proxy',
      },
      // // 阿里的DNS比较稳定，国内的都统一用他
      // {
      //   tag: 'dns_direct',
      //   address: 'https://dns.alidns.com/dns-query',
      //   address_resolver: 'dns_resolver',
      //   detour: 'direct',
      // },
      // dns_resolver用于本地网络做基础查询的
      {
        tag: 'dns_resolver',
        address: '223.5.5.5',
        detour: 'direct',
      },
    ],
    rules: [
      {
        domain: ['time.apple.com'],
        server: 'dns_resolver',
      },
      {
        geosite: ['geolocation-!cn'],
        server: 'dns_proxy',
      },
      {
        geosite: ['cn', 'private'],
        server: 'dns_direct',
      },
      {
        outbound: ['any'],
        server: 'dns_resolver',
      },
    ],
    final: 'dns_direct',
  };
}

export default getSmartDns;
