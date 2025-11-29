import Tracking from '../../tracking/Tracking';

/**
 * 允许的国家代码列表：美国、日本、韩国、台湾、新加坡、马来西亚、泰国
 * 仅对非付费用户限制这些国家
 */
const ALLOWED_COUNTRIES = ['us', 'jp', 'kr', 'tw', 'sg', 'my', 'th'];

interface FilterResult {
  candidates: any[];
  filteredCount: number;
  originalCount: number;
  skipped: boolean;
}

/**
 * 根据国家代码过滤服务器列表，只保留美日韩台新马泰的节点
 * @param servers 服务器列表
 * @param isPaidUser 是否为付费用户，付费用户不进行国家限制
 */
function filterServersByCountry(servers: any[], isPaidUser: boolean = false): FilterResult {
  const originalCount = servers.length;

  // 付费用户不进行国家限制
  if (isPaidUser) {
    Tracking.info('自动选线-国家过滤-付费用户跳过', {
      originalCount,
      isPaidUser,
    });
    return {
      candidates: servers,
      filteredCount: originalCount,
      originalCount,
      skipped: true,
    };
  }

  // 非付费用户只能选择指定国家的节点
  const filtered = servers.filter(server => {
    const flag = `${server?.flag ?? ''}`.toLowerCase();
    return ALLOWED_COUNTRIES.includes(flag);
  });

  const filteredCount = filtered.length;

  Tracking.info('自动选线-国家过滤-非付费用户', {
    originalCount,
    filteredCount,
    allowedCountries: ALLOWED_COUNTRIES,
    isPaidUser,
  });

  // 如果过滤后没有可用节点，返回原列表作为降级方案
  if (filteredCount === 0) {
    Tracking.info('自动选线-国家过滤后无可用节点，使用原列表');
    return {
      candidates: servers,
      filteredCount: 0,
      originalCount,
      skipped: false,
    };
  }

  return {
    candidates: filtered,
    filteredCount,
    originalCount,
    skipped: false,
  };
}

export default filterServersByCountry;
