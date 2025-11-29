import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';

import checkNetworkStatus from '../../../../utils/network/checkNetworkStatus';
import {checkLastDomain, checkLocalDomains} from '../../../helpers/getTsApiDomain';

interface NetworkCheckResult {
  success: boolean;
  notice: string;
}

/**
 * 网络和域名检查 Hook
 *
 * 职责：
 * 1. 检查网络连接状态
 * 2. 串行验证域名可用性（先检查上次域名，再检查域名列表）
 *
 * 注意：必须串行执行避免竞态条件
 * - checkLastDomain(): 只检查，不设置域名
 * - checkLocalDomains(): 会设置新域名到存储
 * - 如果并行执行，会导致域名设置混乱
 */
export const useNetworkAndDomainCheck = (): {
  checkNetworkAndDomain: () => Promise<NetworkCheckResult>;
} => {
  const {t} = useTranslation();

  const checkNetworkAndDomain = useCallback(async (): Promise<NetworkCheckResult> => {
    // 1. 网络连接检查
    if (!(await checkNetworkStatus())) {
      return {
        success: false,
        notice: t('Page_Landing_NetworkCheck_Failed'),
      };
    }

    // 2. 域名检查（串行执行，避免竞态条件）
    // 先检查上次域名是否有效（快速）
    if (await checkLastDomain()) {
      return {
        success: true,
        notice: t('Page_Landing_Stage1_Success'),
      };
    }

    // 上次域名无效，从域名列表中查找（慢速）
    if (await checkLocalDomains()) {
      return {
        success: true,
        notice: t('Page_Landing_Stage2_Success'),
      };
    }

    // 所有域名都无效
    return {
      success: false,
      notice: t('Page_Landing_Domain_Failed'),
    };
  }, [t]);

  return {checkNetworkAndDomain};
};
