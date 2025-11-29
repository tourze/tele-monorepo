async function getCloudFlareGoodIps() {
  // 获取CF优选域名，可以避免我们的域名被人嗅探到
  // 使用例子 curl -iv --connect-to wechat.baidugz.com:443:8.889288.xyz:443 https://wechat.baidugz.com/config/
  // TODO 也可以提取这些公共的服务提供的优选IP https://monitor.gacjie.cn/page/cloudflare/ipv4.html
  return [
    "www.shopifycdn.net",
    "static.cnnet.org",
    "mfoot.eu.org",
    "www.okcupid.com",
    "www.csgo.com",
    "www.visa.com",
    "www.visakorea.com",
    "www.visa.com.hk",
    "www.udemy.com",
    "www.visa.com.sg",
    "www.visa.co.jp",
    "russia.com",
    "ip.sb",
    "time.is",
    "www.4chan.org",
    "www.wto.org",
    "cdn1.impact.com",
    "icook.hk",
    "icook.tw",
    "japan.com",
    "malaysia.com",
    "www.ipget.net",
    "www.iakeys.com",
    "fbi.gov",
    "cdn.issue.us.kg",
    "fast.issue.us.kg"
  ];
}

export default getCloudFlareGoodIps;
