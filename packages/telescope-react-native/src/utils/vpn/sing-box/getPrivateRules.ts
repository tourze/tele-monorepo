/**
 * 私有地址，我们永远都是直连的，要不打不开啊
 */
async function getPrivateRules() {
  return [
    {
      geosite: ['private'],
      outbound: 'direct',
    },
    {
      geoip: ['private'],
      outbound: 'direct',
    },
  ];
}

export default getPrivateRules;
