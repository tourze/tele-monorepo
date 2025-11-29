import isNumber from 'lodash/isNumber';
import cache from 'memory-cache';
import startPing from './startPing';
import Tracking from '../tracking/Tracking';
import {set} from '../../hooks/useStorage';
import hostToIp from '../network/hostToIp';
import pLimit from 'p-limit';

function getCacheKey(ip: string, port: number): string {
  return `ping-${ip}-${port}`;
}

const concurrencyLimit = pLimit(4);
const inFlight = new Map<string, Promise<void>>();

/**
 * 对IP和端口进行一次预备连接，结果缓存一分钟
 */
async function prePing(host: string, port: number, times: number) {
  return concurrencyLimit(async () => {
    let ip = await hostToIp(host);
    if (ip === null) {
      ip = host;
    }

    const key = getCacheKey(ip, port);
    if (cache.get(key)) {
      return;
    }
    const inflightKey = `${key}-inflight`;
    if (inFlight.has(inflightKey)) {
      return inFlight.get(inflightKey);
    }

    const task = (async () => {
      try {
        const res = await startPing(ip, port, times, {bypassVpn: false});
        if (!isNumber(res)) {
          Tracking.info('获得预Ping结果失败', {
            host,
            ip,
            port,
          });
          return;
        }
        cache.put(key, res, 1000 * 60);
        await set(`speed-${ip}-${port}`, {
          speed: res,
          updatedAt: Date.now(),
        });
        if (host !== ip) {
          await set(`speed-${host}-${port}`, {
            speed: res,
            updatedAt: Date.now(),
          });
        }
      } catch (error) {
        Tracking.info('获得预Ping结果失败', {
          host,
          ip,
          port,
          error: `${error}`,
        });
      } finally {
        inFlight.delete(inflightKey);
      }
    })();

    inFlight.set(inflightKey, task);
    await task;
  });
}

/**
 * 尝试读取缓存中的值
 *
 * @param ip
 * @param port
 */
async function getCacheVal(ip: string, port: number) {
  const key = getCacheKey(ip, port);
  const res: number | null = cache.get(key);
  if (isNumber(res)) {
    cache.del(key);
  }
  return res;
}

export default prePing;
export {getCacheVal};
