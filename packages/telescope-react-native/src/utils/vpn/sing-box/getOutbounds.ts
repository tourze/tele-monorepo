async function getOutbounds(node: any) {
  return [
    {
      type: 'shadowsocksr',
      tag: 'proxy',
      server: node.ip,
      server_port: node.port,
      method: node.method,
      password: node.passwd,
      protocol: node.protocol,
      protocol_param: node.protoparam,
      obfs: node.obfs,
      obfs_param: node.obfsparam,
    },
    {
      type: 'direct',
      tag: 'direct',
    },
    {
      type: 'block',
      tag: 'block',
    },
    {
      type: 'dns',
      tag: 'dns-out',
    },
  ];
}

export default getOutbounds;
