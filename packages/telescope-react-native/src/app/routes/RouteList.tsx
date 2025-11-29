import {useUnmountedRef} from 'ahooks';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import isArray from 'lodash/isArray';
import React, {useLayoutEffect, useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  FlatList,
  StatusBar,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  InteractionManager,
} from 'react-native';

import CatchError from '../../components/CatchError';
import Divider from '../../components/Divider';
import Error from '../../components/Error';
import LoadingSpin from '../../components/LoadingSpin';
import {Layout, ListItem} from '../../react-native-ui-kitten/components';

import {useGetStarHomeRouteLines} from '../apis/GetStarHomeRouteLines';
import CheckmarkIcon from '../icons/Checkmark';
import RouteListItem from './route-list/Item';

import useStorage, {remove} from '../../hooks/useStorage';
import useSizeTransform from '../../hooks/useSizeTransform';

// 🔥 重构：使用自定义 Hooks 管理复杂逻辑
import {useRouteSpeed} from './hooks/useRouteSpeed';
import {useRoutePing} from './hooks/useRoutePing';

type RouteLineItem = {
  id: string | number;
  ip: string;
  port: number;
  [key: string]: any;
};

type RouteLinesData = {
  list: RouteLineItem[];
};

const RouteList = ({navigation}) => {
  const {t} = useTranslation();
  const {data: routeLines, error} = useGetStarHomeRouteLines();
  const sizeTransform = useSizeTransform();
  const {data: currentNode} = useStorage('currentNode', null);
  const unmountedRef = useUnmountedRef();
  const isFocused = useIsFocused();

  // Type guard to ensure routeLines has the correct structure
  const typedRouteLines: RouteLinesData | undefined =
    routeLines &&
    typeof routeLines === 'object' &&
    'list' in routeLines &&
    isArray(routeLines.list)
      ? (routeLines as RouteLinesData)
      : undefined;

  // 🔥 使用 useRouteSpeed Hook 管理 speed 状态
  const {speedMap, scheduleSpeedUpdate} = useRouteSpeed({
    routeLines: typedRouteLines,
    unmountedRef,
  });

  // Speed payload 构建函数
  const buildSpeedPayload = React.useMemo(
    () =>
      (value: number | false) => {
        if (value === false) {
          return false;
        }
        return {
          speed: value,
          updatedAt: Date.now(),
        };
      },
    [],
  );

  // 🔥 使用 useRoutePing Hook 管理 ping 测试
  const {refreshAll} = useRoutePing({
    routeLines: typedRouteLines,
    buildSpeedPayload,
    // 本地直推一份，避免事件偶发丢失导致 UI 仍显示占位符
    onSpeedChange: scheduleSpeedUpdate,
  });

  const refreshAllRun = refreshAll.run;
  const refreshAllCancel = refreshAll.cancel;

  // 设置导航栏右侧刷新按钮
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={Platform.select({
            web: {
              marginRight: sizeTransform(20),
            },
          })}
          onPress={refreshAllRun}>
          <Text
            style={{padding: sizeTransform(10), fontSize: sizeTransform(36)}}>
            {t('Refresh')}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, sizeTransform, t, refreshAllRun]);

  const autoPingKeyRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!isFocused || !typedRouteLines?.list?.length) {
      return;
    }

    const key = typedRouteLines.list
      .map(item => `${item.id}-${item.ip}-${item.port}`)
      .join('|');
    if (autoPingKeyRef.current === key) {
      return;
    }
    autoPingKeyRef.current = key;

    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    const interaction = InteractionManager.runAfterInteractions(() => {
      timeoutHandle = setTimeout(() => {
        refreshAllRun();
      }, 400);
    });

    return () => {
      interaction?.cancel?.();
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    };
  }, [isFocused, refreshAllRun, typedRouteLines?.list]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        refreshAllCancel();
        autoPingKeyRef.current = null;
      };
    }, [refreshAllCancel]),
  );

  // 组件卸载时清理
  React.useEffect(() => {
    return () => {
      refreshAllCancel();
    };
  }, [refreshAllCancel]);

  // 选择自动选择模式
  const selectAutoPick = React.useCallback(async () => {
    await remove('homeReconnect');
    await remove('currentNode');
    navigation.pop();
  }, [navigation]);

  // 渲染列表项
  const renderItem = useCallback(
    ({item}) => {
      const speedKey = `speed-${item.ip}-${item.port}`;
      return (
        <RouteListItem
          item={item}
          speed={speedMap[speedKey]}
          selected={
            currentNode && currentNode.id > 0 && currentNode.id === item.id
          }
        />
      );
    },
    [currentNode, speedMap],
  );

  const keyExtractor = useCallback((item: RouteLineItem) => String(item.id), []);

  // 🔥 修复：移除 getItemLayout，让 FlatList 自动计算
  // 硬编码高度不准确会导致快速滚动时渲染错误

  // 渲染页面内容
  const renderPage = () => {
    if (error) {
      return <Error text={error.message} />;
    }
    if (routeLines === undefined || routeLines === null) {
      return <LoadingSpin />;
    }
    if (!typedRouteLines) {
      return <LoadingSpin />;
    }

    return (
      <View style={{flex: 1}}>
        <ListItem
          style={{
            paddingTop: sizeTransform(40),
            paddingBottom: sizeTransform(40),
          }}
          title={
            <View
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
              }}>
              <Text style={{fontSize: sizeTransform(36), fontWeight: 'bold'}}>
                {t('Page_RouteList_AutoConnect_Title')}
              </Text>
              <Text>{t('Page_RouteList_AutoConnect_Desc')}</Text>
            </View>
          }
          accessoryLeft={
            <Image
              source={require('../images/auto-connect.png')}
              style={{width: sizeTransform(100), height: sizeTransform(100)}}
            />
          }
          accessoryRight={
            <View
              style={{
                paddingLeft: sizeTransform(10),
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <CheckmarkIcon selected={!(currentNode && currentNode.id > 0)} />
            </View>
          }
          onPress={selectAutoPick}
        />
        <Divider />

        <FlatList
          data={typedRouteLines.list}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={false}
        />
      </View>
    );
  };

  return (
    <Layout style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated
      />
      {renderPage()}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

RouteList.whyDidYouRender = true;

export default RouteList;
