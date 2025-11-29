import packet from 'dns-packet';
import type {Packet, Answer} from 'dns-packet';
import {Buffer} from 'buffer';
import {isIP} from 'is-ip';
import uniq from 'lodash/uniq';
import {createSocket, type UdpSocket, type UdpMessage} from 'react-native-udp';
import getPublicDnsList, {type PublicDnsServer} from './getPublicDnsList';
import Tracking from '../tracking/Tracking';
import {checkSuspiciousIp} from './poisonedIps';
import getNetworkInfo from '../network/getNetworkInfo';

declare const global: typeof globalThis & {Buffer?: typeof Buffer};

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

type CacheEntry = {
  ips: string[];
  expiresAt: number;
};

const DNS_PORT = 53;
const QUERY_TIMEOUT_MS = 2000;
const DEFAULT_TTL_SECONDS = 60;
const MIN_POSITIVE_TTL_SECONDS = 30;
const NEGATIVE_TTL_SECONDS = 5;
const MAX_CACHE_SIZE = 200;

const cache = new Map<string, CacheEntry>();
const pending = new Map<string, Promise<string[]>>();

function normalizeHost(host: string): string {
  return host.trim().toLowerCase();
}

function pruneCacheIfNeeded() {
  if (cache.size <= MAX_CACHE_SIZE) return;
  const iterator = cache.keys();
  while (cache.size > MAX_CACHE_SIZE) {
    const {value, done} = iterator.next();
    if (done || typeof value === 'undefined') break;
    cache.delete(value);
  }
}

function setCache(host: string, ips: string[], ttlSeconds: number) {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cache.set(host, {ips, expiresAt});
  pruneCacheIfNeeded();
}

function getCache(host: string): string[] | null {
  const entry = cache.get(host);
  if (!entry) return null;
  if (entry.expiresAt > Date.now()) {
    return [...entry.ips];
  }
  cache.delete(host);
  return null;
}

function parseAnswers(answers: Answer[] | undefined): {ips: string[]; ttl: number} {
  if (!answers || answers.length === 0) {
    return {ips: [], ttl: DEFAULT_TTL_SECONDS};
  }
  const ips: string[] = [];
  let minTtl = Infinity;
  answers.forEach(answer => {
    if (answer && answer.type === 'A' && typeof answer.data === 'string') {
      ips.push(answer.data);
      if (typeof answer.ttl === 'number') {
        minTtl = Math.min(minTtl, answer.ttl);
      }
    }
  });
  const ttl =
    ips.length === 0
      ? DEFAULT_TTL_SECONDS
      : Math.max(
          MIN_POSITIVE_TTL_SECONDS,
          Number.isFinite(minTtl) ? Math.max(minTtl, 1) : DEFAULT_TTL_SECONDS,
        );
  return {
    ips: uniq(ips),
    ttl,
  };
}

function filterSuspiciousIps(host: string, server: PublicDnsServer, ips: string[]): string[] {
  if (ips.length === 0) {
    return ips;
  }
  const filtered: string[] = [];
  ips.forEach(ip => {
    const reason = checkSuspiciousIp(ip);
    if (reason) {
      Tracking.info('UDP DNS 过滤可疑 IP', {
        host,
        server: server.address,
        ip,
        reason,
      });
    } else {
      filtered.push(ip);
    }
  });
  return filtered;
}

async function querySingleServer(host: string, server: PublicDnsServer): Promise<{ips: string[]; ttl: number; server: PublicDnsServer}> {
  const socket: UdpSocket = await createSocket();
  const requestId = Math.floor(Math.random() * 0xffff);
  const queryBuffer = packet.encode({
    type: 'query',
    id: requestId,
    flags: packet.RECURSION_DESIRED,
    questions: [
      {
        type: 'A',
        name: host,
        class: 'IN',
      },
    ],
  } as Packet);

  return new Promise((resolve, reject) => {
    let settled = false;
    const cleanup = (cb: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      subscription.remove();
      socket.close().catch(() => {});
      cb();
    };

    const timer = setTimeout(() => {
      cleanup(() => reject(new Error('DNS query timeout')));
    }, QUERY_TIMEOUT_MS);

    const subscription = socket.addListener((message: UdpMessage) => {
      if (settled) {
        return;
      }
      if (message.remotePort !== DNS_PORT) {
        return;
      }
      try {
        const decoded = packet.decode(Buffer.from(message.data)) as Packet;
        if (decoded.id !== requestId) {
          return;
        }
        if (decoded.type !== 'response') {
          throw new Error(`Unexpected DNS packet type: ${decoded.type}`);
        }
        const {ips, ttl} = parseAnswers(decoded.answers);
        const cleaned = filterSuspiciousIps(host, server, ips);
        cleanup(() => resolve({ips: cleaned, ttl, server}));
      } catch (error) {
        cleanup(() => reject(error instanceof Error ? error : new Error(String(error))));
      }
    });

    socket
      .send(new Uint8Array(queryBuffer), server.address, DNS_PORT)
      .catch(error => {
        cleanup(() => reject(error instanceof Error ? error : new Error(String(error))));
      });
  });
}

async function resolveHostOnce(host: string): Promise<string[]> {
  const servers = await getPublicDnsList();
  const networkInfo = await getNetworkInfo();
  const ipv6Enabled = networkInfo?.supportsIPv6 ?? false;
  const effectiveServers: PublicDnsServer[] = ipv6Enabled
    ? servers
    : servers.filter(item => item.family === 4);
  if (effectiveServers.length === 0) {
    Tracking.info('UDP DNS 未找到可用的公共 DNS', {
      host,
      ipv6Enabled,
      totalServers: servers.length,
    });
    return [];
  }
  if (!ipv6Enabled && servers.length !== effectiveServers.length) {
    Tracking.info('UDP DNS 已禁用 IPv6 服务器', {
      host,
      totalServers: servers.length,
      ipv4Only: effectiveServers.length,
    });
  }
  if (servers.length === 0) {
    return [];
  }
  let negativeTtl = NEGATIVE_TTL_SECONDS;
  let finished = false;
  return await new Promise(resolve => {
    let remaining = effectiveServers.length;
    effectiveServers.forEach(server => {
      querySingleServer(host, server)
        .then(({ips, ttl}) => {
          if (finished) {
            return;
          }
          if (ips.length > 0) {
            finished = true;
            setCache(host, ips, ttl);
            Tracking.info('UDP DNS 解析成功', {
              host,
              server: server.address,
              ips,
              ttl,
            });
            resolve(ips);
            return;
          }
          negativeTtl = Math.max(negativeTtl, ttl);
          Tracking.info('UDP DNS 返回空记录', {
            host,
            server: server.address,
            ttl,
          });
        })
        .catch(error => {
          if (!finished) {
            Tracking.info('UDP DNS 查询失败', {
              host,
              server: server.address,
              error,
            });
          }
        })
        .finally(() => {
          remaining -= 1;
          if (!finished && remaining === 0) {
            finished = true;
            setCache(host, [], negativeTtl);
            Tracking.info('UDP DNS 全部查询失败或空记录', {
              host,
              negativeTtl,
            });
            resolve([]);
          }
        });
    });
  });
}

export async function resolveARecords(host: string): Promise<string[]> {
  if (!host) {
    return [];
  }
  if (isIP(host)) {
    return [host];
  }
  const normalized = normalizeHost(host);
  const cached = getCache(normalized);
  if (cached) {
    return cached;
  }
  const existing = pending.get(normalized);
  if (existing) {
    return existing;
  }
  const promise = resolveHostOnce(normalized)
    .catch(error => {
      Tracking.info('UDP DNS 查询异常', {
        host: normalized,
        error,
      });
      setCache(normalized, [], NEGATIVE_TTL_SECONDS);
      return [];
    })
    .finally(() => {
      pending.delete(normalized);
    });
  pending.set(normalized, promise);
  return promise;
}

export function clearDnsCache() {
  cache.clear();
  pending.clear();
}

export default resolveARecords;
