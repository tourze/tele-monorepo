import Tracking from '../../tracking/Tracking';
import getCarrier from '../../device/getCarrier';
import { resolveCarrierKeywords } from './carrierKeywords';

interface FilterResult {
  candidates: any[];
  carrierName: string | null;
  keywords: string[];
  hasMatches: boolean;
}

/**
 * 根据当前运营商过滤服务器列表，若无匹配则回退到原列表
 */
async function filterServersByCarrier(servers: any[]): Promise<FilterResult> {
  const carrierName = await getCarrier();
  const keywords = resolveCarrierKeywords(carrierName);
  if (keywords.length === 0) {
    Tracking.info('自动选线-运营商信息不可用', {
      carrierName,
      serverCount: servers.length,
    });
    return {
      candidates: servers,
      carrierName,
      keywords,
      hasMatches: false,
    };
  }

  const matched = servers.filter(server => {
    const name = `${server?.name ?? ''}`.toLowerCase();
    const label = `${server?.label ?? ''}`.toLowerCase();
    return keywords.some(keyword => name.includes(keyword) || label.includes(keyword));
  });

  if (matched.length > 0) {
    Tracking.info('自动选线-命中运营商线路', {
      carrierName,
      keywords,
      matchedCount: matched.length,
      serverCount: servers.length,
    });
    return {
      candidates: matched,
      carrierName,
      keywords,
      hasMatches: true,
    };
  }

  Tracking.info('自动选线-运营商无匹配，使用全量线路', {
    carrierName,
    keywords,
    serverCount: servers.length,
  });
  return {
    candidates: servers,
    carrierName,
    keywords,
    hasMatches: false,
  };
}

export default filterServersByCarrier;
