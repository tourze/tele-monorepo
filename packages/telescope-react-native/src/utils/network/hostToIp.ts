import { memoize } from 'lodash';
import ExpiryMap from 'expiry-map';
import ipRegex from 'ip-regex';

const cache = new ExpiryMap(1000 * 60 * 3); // Cached values expire after 3 minutes

/**
 * 为了减少客户端DNS污染的困扰，我们自己做一层简单的DNS解析
 *
 * @param host
 * @returns {Promise<*>}
 */
const hostToIp = memoize(async function (host: string) {
  // 始终依赖系统 DNS，不做 JS 层解析/DoH
  if (ipRegex.v4({ exact: true }).test(host)) {
    return host;
  }
  return host;
});

// 特殊的缓存处理
hostToIp.cache = cache;

export default hostToIp;
