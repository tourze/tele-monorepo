type CarrierType = 'chinaMobile' | 'chinaUnicom' | 'chinaTelecom';

interface CarrierConfig {
  type: CarrierType;
  matchers: RegExp[];
  keywords: string[];
}

// 预设常见运营商及其命中关键词（统一使用小写便于比较）
const carrierConfigs: CarrierConfig[] = [
  {
    type: 'chinaMobile',
    matchers: [/移动/, /cmcc/i, /china[\s-]*mobile/i, /cmi/i],
    keywords: ['移动', 'cmcc', 'cmi', 'china mobile'],
  },
  {
    type: 'chinaUnicom',
    matchers: [/联通/, /unicom/i, /cucc/i],
    keywords: ['联通', 'cucc', 'unicom', 'china unicom'],
  },
  {
    type: 'chinaTelecom',
    matchers: [/电信/, /telecom/i, /ctcc/i, /cnc/i],
    keywords: ['电信', 'ctcc', 'cnc', 'telecom', 'china telecom'],
  },
];

/**
 * 根据运营商名称解析需要匹配的关键词，关键字段统一转为小写
 */
function resolveCarrierKeywords(carrierName: string | null): string[] {
  if (!carrierName) {
    return [];
  }
  const normalized = carrierName.trim();
  if (!normalized) {
    return [];
  }

  const lower = normalized.toLowerCase();
  const config = carrierConfigs.find(cfg =>
    cfg.matchers.some(pattern => pattern.test(normalized) || pattern.test(lower)),
  );

  if (!config) {
    return [];
  }

  return config.keywords.map(keyword => keyword.toLowerCase());
}

export { resolveCarrierKeywords };
