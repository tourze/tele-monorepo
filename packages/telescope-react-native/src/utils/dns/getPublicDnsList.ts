export type PublicDnsServer = {
  address: string;
  family: 4 | 6;
};

const SERVERS: PublicDnsServer[] = [
  {address: '119.29.29.29', family: 4}, // 腾讯
  {address: '223.5.5.5', family: 4}, // 阿里
  {address: '223.6.6.6', family: 4},
  {address: '114.114.114.114', family: 4}, // 电信
  {address: '114.114.115.115', family: 4},
  {address: '101.226.4.6', family: 4}, // 上海电信
  {address: '1.2.4.8', family: 4}, // CNNIC
  {address: '180.76.76.76', family: 4}, // 百度
  {address: '1.1.1.1', family: 4}, // Cloudflare (国内直连)
  {address: '240c::6666', family: 6}, // 腾讯 IPv6
  {address: '2400:3200::1', family: 6}, // 阿里 IPv6
  {address: '2400:da00::6666', family: 6}, // 百度 IPv6
  {address: '2402:4e00::', family: 6}, // 114DNS IPv6
  {address: '2001:4860:4860::8888', family: 6}, // Google IPv6（偶有直连）
  {address: '2606:4700:4700::1111', family: 6}, // Cloudflare IPv6
];

async function getPublicDnsList(): Promise<PublicDnsServer[]> {
  return SERVERS;
}

export default getPublicDnsList;
