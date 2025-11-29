import {useCallback} from 'react';

import getStorageItem from '../../../../utils/storage/getStorageItem';
import Tracking from '../../../../utils/tracking/Tracking';
import tryLogin from '../tryLogin';

interface LoginResult {
  needLogin: boolean;
  isTrialLogin: boolean;
}

/**
 * 自动登录 Hook
 *
 * 职责：
 * 1. 尝试使用已保存的凭证自动登录
 * 2. 检查是否为试用登录状态
 * 3. 处理登录异常情况
 */
export const useAutoLogin = (): {
  attemptAutoLogin: () => Promise<LoginResult>;
} => {
  const attemptAutoLogin = useCallback(async (): Promise<LoginResult> => {
    let needLogin = true;
    let isTrialLogin = false;

    try {
      // 1. 尝试自动登录
      await tryLogin();
      needLogin = false;

      // 2. 检查试用登录标记
      try {
        const trialFlag = await getStorageItem('trialLogin');
        isTrialLogin = trialFlag === 'true' || trialFlag === true;
      } catch (e) {
        isTrialLogin = false;
      }
    } catch (e: unknown) {
      // 登录失败，记录日志但不影响主流程
      Tracking.info('tryLogin失败', {
        error: e,
      });
    }

    return {needLogin, isTrialLogin};
  }, []);

  return {attemptAutoLogin};
};
