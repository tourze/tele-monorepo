import React, { useEffect } from 'react';
import type { ComponentType } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, Text, Platform } from 'react-native';
import { ListItem } from '../../react-native-ui-kitten/components';
import Divider from '../../components/Divider';
import { withErrorBoundary } from 'react-error-boundary';
import { useRoute } from '@react-navigation/core';
import useStorage from '../../hooks/useStorage';
import useSizeTransform from '../../hooks/useSizeTransform';
import ConnectBtn from './home/ConnectBtn';
import HomeHeader from './home/Header';
import HomeMessage from './home/Message';
import HomeEthMode from './home/EthMode';
import HomeProxyMode from './home/ProxyMode';
import CatchError from '../../components/CatchError';
import { useTranslation } from 'react-i18next';
import { useGetStarHomeUserInfo } from '../apis/GetStarHomeUserInfo';
import { useRequest } from 'ahooks';
import NodeButton from './home/NodeButton';
import BigBg from './home/BigBg';
import ShareButton from './home/ShareButton';
import KefuButton from './home/KefuButton';
import useAppState from '../../hooks/useAppState';
import getChannelName from '../../utils/app/getChannelName';
import useHomeSpeedMonitor from './home/hooks/useHomeSpeedMonitor';
import useRenderBaseline from './home/hooks/useRenderBaseline';
import useHomeConnection from './home/hooks/useHomeConnection';
import useHomeLifecycle from './home/hooks/useHomeLifecycle';
import useHomePrecheck from './home/hooks/useHomePrecheck';
import useHomeNodeReporter from './home/hooks/useHomeNodeReporter';
import { HomeContextProvider } from './home/context/HomeContext';

const Home = ({ navigation }) => {
  useRenderBaseline('Home');
  const { t } = useTranslation();
  const sizeTransform = useSizeTransform();
  const currentAppState = useAppState();
  const route: any = useRoute();

  // 使用 useStorage 钩子管理状态
  const { data: connected, update: setConnected } = useStorage('connected', false);
  const { data: token } = useStorage('token', null);
  const { data: trialLogin } = useStorage('trialLogin', false);
  const { data: currentNode, update: updateCurrentNode, remove: removeCurrentNode } = useStorage('currentNode', null);
  const { data: homeReconnect, update: updateHomeReconnect } = useStorage('homeReconnect', false);

  // 使用自定义数据获取钩子
  const {
    data: userInfo,
    loading: userInfoLoading,
    refresh: refreshUserInfo,
  } = useGetStarHomeUserInfo();

  const { data: channelName } = useRequest(getChannelName);
  useHomePrecheck();
  useHomeSpeedMonitor(currentNode);
  const { onSelectRoute } = useHomeConnection({
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
  });
  useHomeLifecycle({
    navigation,
    route,
  });
  useHomeNodeReporter(currentNode, removeCurrentNode);

  return (
    <HomeContextProvider
      connected={!!connected}
      setConnected={setConnected}
      homeReconnect={!!homeReconnect}
      updateHomeReconnect={updateHomeReconnect}
      token={token}
      trialLogin={!!trialLogin}
      currentNode={currentNode}
      updateCurrentNode={updateCurrentNode}
      removeCurrentNode={removeCurrentNode}
      userInfo={userInfo}
      userInfoLoading={!!userInfoLoading}
      refreshUserInfo={refreshUserInfo}
      channelName={channelName}
      currentAppState={currentAppState}
    >
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#b7d3f5"
          animated={true}
        />

        <SafeAreaView style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <HomeHeader />

          {/* 背景图 */}
          <BigBg />

          {!['MTP', 'SM', 'SD', 'QH'].includes(channelName) && (
            <HomeMessage />
          )}

          <ConnectBtn navigation={navigation} />

          <View
            style={{
              padding: sizeTransform(20),
              backgroundColor: '#fff',
              borderTopLeftRadius: sizeTransform(60),
              borderTopRightRadius: sizeTransform(60),
            }}>
            <ShareButton navigation={navigation} />

            <HomeEthMode />

            <HomeProxyMode />

            <ListItem
              title={() => (
                <Text style={styles.itemTitle}>{t('Page_Home_CurrentArea')}</Text>
              )}
              description={() => (
                <Text style={styles.itemDesc}>
                  {userInfo?.paidUser && currentNode
                    ? currentNode.name
                    : t('Page_Home_PleaseSelectNode')}
                </Text>
              )}
              accessoryRight={NodeButton}
              onPress={onSelectRoute}
            />
            <Divider />
            <KefuButton />
          </View>
        </SafeAreaView>
      </View>
    </HomeContextProvider>
  );
};

const styles = StyleSheet.create({
  toCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 与“分流模式”保持一致的标题/副标题样式
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0.2,
  },
  itemDesc: {
    marginTop: 2,
    fontSize: 12,
    color: '#8A94A6',
    fontWeight: '400',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    ...Platform.select({
      web: {
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
    }),
  },
});

// 显式标注导出组件类型，避免 TS2742 推断到非可移植的 @types/react 路径
// @ts-ignore
const HomeWithBoundary: ComponentType<any> = withErrorBoundary(Home as ComponentType<any>, {
  FallbackComponent: CatchError,
});

export default HomeWithBoundary;
