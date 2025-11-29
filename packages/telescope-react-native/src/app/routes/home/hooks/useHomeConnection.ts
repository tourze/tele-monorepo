import { useCallback, useEffect, useRef } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { useInterval, useDebounceFn } from 'ahooks';
import Loading from '../../../../utils/ui/Loading';
import Tracking from '../../../../utils/tracking/Tracking';
import toastError from '../../../../utils/ui/toastError';
import vpnStatus from '../../../../utils/vpn/vpnStatus';
import vpnStop from '../../../../utils/vpn/vpnStop';
import callTsJsonRpcAPI from '../../../helpers/callTsJsonRpcAPI';
import vpnPrepare from '../../../../utils/vpn/vpnPrepare';
import vpnStart from '../../../../utils/vpn/vpnStart';
import setStorageItem from '../../../../utils/storage/setStorageItem';
import dayjs from 'dayjs';
import confirm from '../../../../utils/ui/confirm';
import { GetStarHomeUserInfo } from '../../../apis/GetStarHomeUserInfo';

type UseHomeConnectionParams = {
  navigation: any;
  currentNode: any;
  homeReconnect: boolean;
  updateHomeReconnect: (value: boolean) => Promise<void>;
  setConnected: (value: boolean) => Promise<void>;
  connected: boolean;
  userInfo: any;
  t: (key: string) => string;
  trialLogin: boolean;
  token: string | null;
  currentAppState: string;
  channelName?: string | null;
};

const useHomeConnection = ({
  navigation,
  currentNode,
  homeReconnect,
  updateHomeReconnect,
  setConnected,
  connected,
  userInfo,
  t,
  trialLogin,
  token,
  currentAppState,
  channelName,
}: UseHomeConnectionParams) => {
  const connectedRef = useRef<boolean>(connected);
  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    connectedRef.current = connected;
  }, [connected]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const confirmUpgrade = useDebounceFn(() => {
    confirm(
      '请先升级会员',
      '请升级会员等级后再进行此操作',
      t('Page_Home_AutoPick_Failed_GoBuy'),
      t('Cancel'),
    ).then(() => {
      navigation.push('PricingPlan');
    });
  }, { leading: true, trailing: false });

  const refreshStatus = useCallback(async () => {
    if (currentAppState === 'background') {
      return;
    }
    if (!currentNode) {
      return;
    }

    try {
      const status = await vpnStatus();
      if (status && !connectedRef.current && isMounted.current) {
        await setConnected(true);
        connectedRef.current = true;
      }
      if (!status && connectedRef.current && isMounted.current) {
        await setConnected(false);
        connectedRef.current = false;
      }
    } catch (e) {
      if (isMounted.current) {
        Tracking.info('首页-定时检查VPN状态时出错', {
          error: `${e}`,
          nodeId: currentNode?.id,
        });
        await setConnected(false);
        connectedRef.current = false;
      }
    }
  }, [currentAppState, currentNode, setConnected]);

  useEffect(() => {
    refreshStatus();
    if (DeviceEventEmitter) {
      DeviceEventEmitter.emit('ENTER_HOME');
    }
  }, [refreshStatus]);

  useInterval(refreshStatus, 1000 * 3);

  useEffect(() => {
    if (!homeReconnect) {
      return;
    }

    (async () => {
      Tracking.info('尝试自动连接了', {
        homeReconnect,
        currentNode,
      });

      let targetUserInfo = userInfo;
      if (!targetUserInfo) {
        targetUserInfo = await GetStarHomeUserInfo();
      }
      if (targetUserInfo?.timeRemaining <= 0) {
        toastError('已经过期，请购买套餐');
        return;
      }

      await Loading.show('网络优化中');
      await updateHomeReconnect(false);

      try {
        const status = await vpnStatus();
        if (status) {
          await callTsJsonRpcAPI('d813562', { newNode: currentNode });
          await vpnStop();
          await setConnected(false);
          connectedRef.current = false;
        }
      } catch (e) {
        Tracking.info('自动连接-停用旧服务失败', {
          error: `${e}`,
        });
        if (isMounted.current) {
          await setConnected(false);
          connectedRef.current = false;
          await Loading.hide();
          toastError(t('Page_Home_StopService_Failed'));
        }
        return;
      }

      if (!currentNode) {
        if (isMounted.current) {
          await setConnected(false);
          connectedRef.current = false;
          await Loading.hide();
        }
        return;
      }

      let connResult = false;
      let errorMessage: string | undefined;
      try {
        await callTsJsonRpcAPI('googlePlay89566', { node: currentNode });
        await vpnPrepare();
        connResult = await vpnStart(currentNode);
        await setStorageItem('vpnStartTime', `${dayjs().unix()}`);
      } catch (e: any) {
        errorMessage = e?.message;
        Tracking.info('自动连接-连接VPN失败', {
          error: `${e}`,
          nodeId: currentNode.id,
        });
      }

      if (connResult) {
        if (isMounted.current) {
          await setConnected(true);
          connectedRef.current = true;
          await Loading.hide();
        }
      } else {
        if (isMounted.current) {
          await setConnected(false);
          connectedRef.current = false;
          await Loading.hide();
          if (errorMessage) {
            toastError(`${t('Page_Home_StartService_FailedWithMessage')}: ${errorMessage}`);
          } else {
            toastError(t('Page_Home_StartService_FailedWithoutMessage'));
          }
        }
      }
    })()
      .then(() => {
        if (isMounted.current) {
          Loading.hide();
        }
      })
      .catch(() => {
        if (isMounted.current) {
          Loading.hide();
        }
      });
  }, [
    homeReconnect,
    currentNode,
    navigation,
    setConnected,
    updateHomeReconnect,
    userInfo,
    t,
  ]);

  const handleRouteList = useDebounceFn(() => {
    Tracking.info('首页-底部-选择线路');

    if (!token) {
      navigation.push('Login');
      return;
    }

    if (userInfo?.isTrial || trialLogin) {
      navigation.push('Login', { allowSkip: true, next: 'RouteList' });
      return;
    }

    if (
      ['MTP', 'SM', 'SD', 'QH'].includes(channelName as string) &&
      !userInfo?.paidUser
    ) {
      confirmUpgrade.run();
      return;
    }

    navigation.push('RouteList');
  }, { leading: true, trailing: false });

  return {
    onSelectRoute: handleRouteList.run,
  };
};

export default useHomeConnection;
