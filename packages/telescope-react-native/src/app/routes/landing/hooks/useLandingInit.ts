import {useSafeState} from 'ahooks';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';

import isElevated from '../../../../utils/app/isElevated';
import removeStorageItem from '../../../../utils/storage/removeStorageItem';
import Tracking from '../../../../utils/tracking/Tracking';

import {useAutoLogin} from './useAutoLogin';
import {useBackgroundUpdates} from './useBackgroundUpdates';
import {useNetworkAndDomainCheck} from './useNetworkAndDomainCheck';
import {useRemoteConfig} from './useRemoteConfig';

interface NavigationProp {
  replace: (route: string, params?: Record<string, unknown>) => void;
}

interface LandingState {
  networkOk: boolean;
  networkNotice: string | null;
}

/**
 * Landing 页面初始化总控 Hook
 *
 * 职责：
 * 1. 协调所有初始化步骤的执行顺序
 * 2. 管理页面状态（网络状态、提示信息）
 * 3. 根据初始化结果决定导航目标
 *
 * 执行流程：
 * 1. 权限检查（管理员权限）
 * 2. 网络和域名检查
 * 3. 远程配置同步
 * 4. 自动登录尝试
 * 5. 启动后台更新（不阻塞）
 * 6. 导航到首页
 */
export const useLandingInit = (
  channelName: string | undefined,
  navigation: NavigationProp
): LandingState => {
  const {t} = useTranslation();
  const [networkOk, setNetworkOk] = useSafeState(true);
  const [networkNotice, setNetworkNotice] = useSafeState<string | null>(null);

  const {checkNetworkAndDomain} = useNetworkAndDomainCheck();
  const {syncRemoteConfig} = useRemoteConfig();
  const {attemptAutoLogin} = useAutoLogin();
  const {startBackgroundUpdates} = useBackgroundUpdates();

  useEffect(() => {
    if (!channelName) {
      return;
    }

    // 清理 homeReconnect 标识位
    removeStorageItem('homeReconnect');

    const init = async (): Promise<void> => {
      // 1. 网络和域名检查
      setNetworkNotice(t('Page_Landing_Stage1_Loading'));
      const networkResult = await checkNetworkAndDomain();

      if (!networkResult.success) {
        setNetworkNotice(networkResult.notice);
        setNetworkOk(false);
        return;
      }

      setNetworkNotice(networkResult.notice);

      // 2. 远程配置同步
      await syncRemoteConfig(channelName);

      // 3. 自动登录
      const {needLogin, isTrialLogin} = await attemptAutoLogin();

      // 4. 启动后台更新（不等待，不阻塞导航）
      startBackgroundUpdates();

      // 5. 导航到首页
      if (needLogin) {
        navigation.replace('Home', {forceLogin: true});
      } else if (isTrialLogin) {
        navigation.replace('Home', {promptTrialLogin: true});
      } else {
        navigation.replace('Home');
      }
    };

    // 权限检查 + 初始化
    isElevated()
      .then(elevated => {
        if (!elevated) {
          setNetworkNotice('请使用管理员权限重新运行');
          setNetworkOk(false);
          return;
        }

        init().catch(err => {
          Tracking.info('网络优化失败', {
            error: err,
          });
          setNetworkOk(false);
        });
      })
      .catch(() => {
        setNetworkNotice('权限检查失败');
        setNetworkOk(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  return {networkOk, networkNotice};
};
