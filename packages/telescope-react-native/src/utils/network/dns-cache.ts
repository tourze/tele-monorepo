/**
 * DNS 解析缓存工具
 *
 * 功能：
 * - 缓存 DNS 解析结果，避免重复网络请求
 * - 支持 TTL（Time To Live）过期机制
 * - 自动降级到原始 hostname
 */

import hostToIp from './hostToIp';

const DNS_CACHE_TTL = 5 * 60 * 1000; // 5分钟 TTL

interface CacheEntry {
  host: string;
  timestamp: number;
}

class DnsCache {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * 带缓存的 DNS 解析
   * @param hostname 域名或IP地址
   * @returns 解析后的 IP 地址，如果解析失败则返回原始 hostname
   */
  async resolve(hostname: string): Promise<string> {
    const now = Date.now();
    const cached = this.cache.get(hostname);

    // 检查缓存是否有效
    if (cached && now - cached.timestamp < DNS_CACHE_TTL) {
      return cached.host;
    }

    // 缓存过期或不存在，执行 DNS 解析
    try {
      const host = await hostToIp(hostname);
      const resolvedHost = typeof host === 'string' && host.length > 0 ? host : hostname;
      this.cache.set(hostname, {host: resolvedHost, timestamp: now});
      return resolvedHost;
    } catch (err) {
      // DNS 解析失败，返回原始 hostname
      return hostname;
    }
  }

  /**
   * 清除指定 hostname 的缓存
   */
  clear(hostname: string): void {
    this.cache.delete(hostname);
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }
}

// 导出单例实例
export const dnsCache = new DnsCache();

// 导出便捷函数
export const cachedHostToIp = (hostname: string) => dnsCache.resolve(hostname);
