import { useCallback } from 'react';
import { Platform } from 'react-native';
import { useAsyncEffect, useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import Tracking from '../../../../utils/tracking/Tracking';
import toastError from '../../../../utils/ui/toastError';
import toastWarn from '../../../../utils/ui/toastWarn';
import Loading from '../../../../utils/ui/Loading';
import vpnStatus from '../../../../utils/vpn/vpnStatus';
import vpnStop from '../../../../utils/vpn/vpnStop';
import vpnStart from '../../../../utils/vpn/vpnStart';
import callTsJsonRpcAPI from '../../../helpers/callTsJsonRpcAPI';
import autoPickNode from '../../../../utils/node/auto-pick';
import confirm from '../../../../utils/ui/confirm';
import setStorageItem from '../../../../utils/storage/setStorageItem';
import { useGetStarHomeRouteLines } from '../../../apis/GetStarHomeRouteLines';
import { useHomeActions, useHomeState } from '../context/HomeContext';

type UseHomeConnectButtonParams = {
  navigation: any;
};

type UseHomeConnectButtonResult = {
  connected: boolean;
  onConnectPress: () => void;
};

const useHomeConnectButton = ({ navigation }: UseHomeConnectButtonParams): UseHomeConnectButtonResult => {
  const { t } = useTranslation();
  const {
    connected,
    currentNode,
    token,
    userInfo,
    userInfoLoading,
  } = useHomeState();
  const {
    setConnected,
    updateCurrentNode,
    refreshUserInfo,
  } = useHomeActions();

  const { data: routeLines, loading: loadingRouteLines } = useGetStarHomeRouteLines();

  useAsyncEffect(async () => {
    if (!userInfoLoading && userInfo && userInfo?.timeRemaining <= 0) {
      const status = await vpnStatus();
      if (status) {
        callTsJsonRpcAPI('d813562', { newNode: currentNode });
        await vpnStop();
        Tracking.info('自动断开');
        await setConnected(false);
        await Loading.hide();
        toastError('套餐已过期，请充值后继续');
        refreshUserInfo();
      }
    }
  }, [currentNode, refreshUserInfo, setConnected, userInfo, userInfoLoading]);

  const closeConnect = useCallback(async () => {
    if (currentNode !== null) {
      callTsJsonRpcAPI('d813562', {
        newNode: currentNode,
      }).catch(console.error);
    }
    await vpnStop();
    console.log('界面上断开--6');
    await setConnected(false);
  }, [currentNode, setConnected]);

  const clickConnectButton = useDebounceFn(async () => {
    if (!token) {
      closeConnect();
      navigation.push('Login');
      return;
    }

    let status;
    try {
      status = await vpnStatus();
      console.log('当前服务状态2', status);
    } catch (e) {
      closeConnect();
      Tracking.info('点击连接-查询连接状态失败', {
        error: `${e}`,
      });

      toastError(t('Page_Home_StartService_CheckStatusFailed'));
      return;
    }

    if (status) {
      await Loading.show('清理网络进程');
      Tracking.info('首页-点击断开连接');
      await closeConnect();
      await Loading.hide();
      return;
    }

    if (!userInfoLoading && userInfo) {
      if (userInfo?.timeRemaining <= 0) {
        toastError('已过期请续费后继续');
        closeConnect();
        return;
      }
    }

    await Loading.show('网络优化中');
    let n = currentNode;
    if (!currentNode) {
      if (loadingRouteLines) {
        await Loading.hide();
        await toastWarn('线路加载中，请稍等片刻');
        return;
      }

      let servers = [];
      let pickOne = null;
      try {
        servers = routeLines ? routeLines.list : [];
        if (servers.length > 0) {
          pickOne = await autoPickNode(servers, userInfo);
        }
      } catch (e: any) {
        console.log('界面上断开--7');
        await setConnected(false);
        await Loading.hide();

        confirm(
          t('Page_Home_AutoPick_Failed_Title'),
          e.message,
          t('Page_Home_AutoPick_Failed_GoBuy'),
          t('Cancel'),
        ).then(() => {
          navigation.push('PricingPlan');
        });
        return;
      }

      if (servers.length === 0) {
        confirm(
          t('Page_Home_AutoPick_NoServer_Title'),
          t('Page_Home_AutoPick_NoServer_Message'),
          t('Page_Home_AutoPick_NoServer_GoBuy'),
        ).then(() => {
          navigation.navigate('Home', { screen: 'PricingPlan' });
        });
        console.log('界面上断开--8');
        await setConnected(false);
        await Loading.hide();
        return;
      }

      if (!pickOne) {
        confirm(
          t('Page_Home_AutoPick_PickEmpty_Title'),
          t('Page_Home_AutoPick_PickEmpty_Message'),
          t('Page_Home_AutoPick_PickEmpty_RouteList'),
          t('Cancel'),
        ).then(() => {
          navigation.push('RouteList');
        });
        console.log('界面上断开--9');
        await setConnected(false);
        await Loading.hide();
        return;
      }
      await updateCurrentNode(pickOne);
      n = pickOne;
    }

    Tracking.info('首页-点击进行连接', n);

    let errorMsg = t('Page_Home_Connect_Failed_Title');
    if (Platform.OS === 'web') {
      errorMsg += '可以尝试进去个人中心->关于我们->导出日志文件，并发送给在线客服。';
    }
    let connResult;
    try {
      console.log('connect service', 2);
      await callTsJsonRpcAPI('googlePlay89566', { node: n });
      connResult = await vpnStart(n);
      await setStorageItem('vpnStartTime', `${dayjs().unix()}`);
      console.log('connResult--1', connResult);
    } catch (error: any) {
      Tracking.info('首页-点击进行连接-连接VPN失败', {
        error: error,
        nodeId: n.id,
      });
      connResult = false;
      console.log('connResult--3', connResult);
      errorMsg = error.message;
    }

    if (connResult) {
      await setConnected(true);
      await Loading.hide();
    } else {
      console.log('界面上断开--10');
      await setConnected(false);
      await Loading.hide();
      toastError(errorMsg);
    }
  }, [
    closeConnect,
    currentNode,
    loadingRouteLines,
    navigation,
    routeLines,
    setConnected,
    t,
    token,
    updateCurrentNode,
    userInfo,
    userInfoLoading,
  ], { leading: true, trailing: false });

  return {
    connected: !!connected,
    onConnectPress: clickConnectButton.run,
  };
};

export type { UseHomeConnectButtonResult };
export default useHomeConnectButton;
