import {isIP} from 'is-ip';
import extractHostAndPort from './extractHostAndPort';
import {resolveARecords} from '../dns/udpDnsResolver';
import Tracking from '../tracking/Tracking';

export interface DnsResolutionResult {
  ipOverride?: string;
}

export async function resolveIpOverride(url: string): Promise<DnsResolutionResult> {
  const target = extractHostAndPort(url);
  if (!target) {
    return {};
  }
  const host = target.host;
  if (isIP(host)) {
    return {};
  }
  try {
    const ips = await resolveARecords(host);
    if (ips.length > 0) {
      return {
        ipOverride: ips[0],
      };
    }
  } catch (error) {
    Tracking.info('DNS 解析失败，回退到默认解析', {
      url,
      host,
      error,
    });
  }
  return {};
}

export default resolveIpOverride;
