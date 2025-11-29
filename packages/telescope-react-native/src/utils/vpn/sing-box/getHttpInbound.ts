import getHttpProxyPort from '../getHttpProxyPort';
import getSocks5ProxyPort from '../getSocks5ProxyPort';

async function getHttpInbound() {
  return [
    {
      type: 'socks',
      tag: 'socks-in',
      listen: '127.0.0.1',
      listen_port: await getSocks5ProxyPort(),
    },
    {
      type: 'http',
      tag: 'http-in',
      listen: '127.0.0.1',
      listen_port: await getHttpProxyPort(),
      set_system_proxy: true,
    },
  ];
}

export default getHttpInbound;
