export const SsLocalConfigFileName = 'ss-local-config.json';
export const SingBoxConfigFileName = 'sing-box.json';

// 注意：模拟器环境下，这些域名多数无法通过系统 DNS 解析
// 为了保证开发期可用，在 __DEV__ 下优先尝试直连 IP（如果后端允许明文/同端口 JSON-RPC）
export const apiDomains = [
  // 开发期优先：直连 IP 放最前，避免 DNS 解析失败导致的 TypeError(Network request failed)
  ...(__DEV__ ? ['http://139.198.120.131:45080'] : []),

  'https://nx-api-01.telescoep2.vip',
  'https://nx-api-02.telescoep2.vip',
  'https://nx-api-03.telescoep2.vip',
  'https://nx-api-04.telescoep2.vip',
  'https://api-2.quickg.cc',
  'https://music.telescope1.vip',
  'https://api.telescoep2.vip',
  'https://qwert-api.quickg.cc',
  //'https://api.quickg.vip', // 这个太慢了
  //'https://ttapi.yanxiancloud.com:51443', // 2024-09-18 江苏封了

  // 失效了
  // 'https://shop.gszdg.com',
  // 'https://shop.dwplj.cn',

  'https://api1.lbzdl.cn',
  'https://api1.jiasubet.cn',

  // 'http://10.37.129.2:8002',
];
