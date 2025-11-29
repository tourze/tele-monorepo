import React, { useCallback } from 'react';
import { Text, View, StyleSheet, Pressable, Platform } from 'react-native';
// 不使用 ListItem 包裹，避免整块可点击的视觉反馈
import useSizeTransform from '../../../hooks/useSizeTransform';
import useStorage from '../../../hooks/useStorage';
import {useTranslation} from 'react-i18next';
import toastWarn from '../../../utils/ui/toastWarn';
import { useGetStarHomeUserInfo } from '../../apis/GetStarHomeUserInfo';

const HomeProxySwitch = () => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  // 0智能 1全局
  const {data: proxyMode, update: setProxyMode} = useStorage('proxyMode', 0);
  const {data: connected} = useStorage('connected', false);

  // 显式选择某个模式（避免仅靠切换带来的误触）
  const handleSelect = useCallback(async (mode: 0 | 1) => {
    if (connected) {
      toastWarn(t('Page_Home_DisconnectBeforeChange'));
      return;
    }
    if (proxyMode !== mode) {
      await setProxyMode(mode);
    }
  }, [connected, proxyMode, setProxyMode, t]);

  return (
    <View style={[styles.segmentGroup, { height: Math.max(36, sizeTransform(36)) }]}>
      <Pressable
        accessibilityRole="button"
        onPress={() => handleSelect(0)}
        style={[styles.segmentItem, proxyMode === 0 && styles.segmentItemActive]}
      >
        <Text numberOfLines={1} style={[styles.segmentText, proxyMode === 0 && styles.segmentTextActive]}>
          {t('Page_Home_ProxyMode_Smart')}
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => handleSelect(1)}
        style={[styles.segmentItem, proxyMode === 1 && styles.segmentItemActive]}
      >
        <Text numberOfLines={1} style={[styles.segmentText, proxyMode === 1 && styles.segmentTextActive]}>
          {t('Page_Home_ProxyMode_Global')}
        </Text>
      </Pressable>
    </View>
  );
};

const HomeProxyMode = () => {
  const {t} = useTranslation();

  const { data: userInfo } = useGetStarHomeUserInfo();

  const {data: connected} = useStorage('connected', false);

  // 0智能 1全局
  const {data: proxyMode, update: setProxyMode} = useStorage('proxyMode', 0);

  const switchAction = useCallback(async () => {
    if (connected) {
      toastWarn(t('Page_Home_DisconnectBeforeChange'));
      return;
    }

    if (proxyMode === 0) {
      await setProxyMode(1);
    } else {
      await setProxyMode(0);
    }
  }, [connected, proxyMode, setProxyMode, t]);

  return (
    <View style={styles.listRow}>
      <Text style={styles.itemTitle}>分流模式</Text>
      <Text style={styles.itemDesc}>
        {userInfo?.paidUser ? '识别国内外网络' : '自动优化网络连接'}
      </Text>
      <View style={styles.segmentWrapper}>
        <HomeProxySwitch />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listRow: { width: '100%', paddingTop: 8, paddingBottom: 12 },
  block: { width: '100%' },
  // 标题/次标题：明确主次层级
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
  segmentWrapper: { width: '100%', marginTop: 10 },
  segmentGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderRadius: 24,
    padding: 2,
    borderWidth: 2,
    borderColor: '#D6E4FF',
    // 在自定义 children 内使用，宽度占满
    width: '100%',
  },
  segmentItem: {
    flex: 1,
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // RN Web 友好：手型指针
    ...Platform.select({
      web: { cursor: 'pointer' },
      default: {},
    }),
  },
  segmentItemActive: {
    backgroundColor: '#1890ff',
    shadowColor: '#1890ff',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    // Android 阴影
    elevation: 2,
  },
  segmentText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
});

export default HomeProxyMode;
