import getHttpInbound from './getHttpInbound';

async function getTunInbound() {
  return [
    {
      type: 'tun',
      tag: 'tun-in',
      inet4_address: '172.19.0.1/30',
      auto_route: true,
      // 参考ISSUE https://github.com/2dust/v2rayN/issues/5035
      sniff: true,
    },
    ...(await getHttpInbound()),
  ];
}

export default getTunInbound;
