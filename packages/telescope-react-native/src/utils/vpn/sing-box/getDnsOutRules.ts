async function getDnsOutRules() {
  return [
    // 参考ISSUE https://github.com/2dust/v2rayN/issues/5035
    {
      outbound: 'dns-out',
      protocol: ['dns'],
    },
    {
      outbound: 'dns-out',
      port: 53,
    },
  ];
}

export default getDnsOutRules;
