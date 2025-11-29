import React, { useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import useStorage from '../../../hooks/useStorage';
import toastWarn from '../../../utils/ui/toastWarn';
import getSocks5ProxyPort from '../../../utils/vpn/getSocks5ProxyPort';
import getHttpProxyPort from '../../../utils/vpn/getHttpProxyPort';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import useSizeTransform from '../../../hooks/useSizeTransform';

const HomeEthMode__forWeb = () => {
  const {t} = useTranslation();
  // 0网页 1网卡，一般只有PC才会关心这个
  const {data: ethMode, update: setEthMode} = useStorage('ethMode', 0);
  const sizeTransform = useSizeTransform();

  const {data: connected} = useStorage('connected', false);

  const {data: socks5ProxyPort} = useRequest(getSocks5ProxyPort);
  const {data: httpProxyPort} = useRequest(getHttpProxyPort);

  const selectMode = useCallback((mode: 0 | 1) => {
    if (connected) {
      toastWarn(t('Page_Home_DisconnectBeforeChange'));
      return;
    }
    if (mode !== ethMode) setEthMode(mode);
  }, [connected, ethMode, setEthMode, t]);

  return (
    <View style={styles.listRow}>
      <Text style={styles.itemTitle}>{t('Page_Home_EthMode_Scene')}</Text>
      <Text style={styles.itemDesc}>{`HTTP:${httpProxyPort}, SOCKS5:${socks5ProxyPort}`}</Text>
      <View style={[styles.segmentGroup, { height: Math.max(36, sizeTransform(36)) }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => selectMode(0)}
          style={[styles.segmentItem, ethMode === 0 && styles.segmentItemActive]}
        >
          <Text numberOfLines={1} style={[styles.segmentText, ethMode === 0 && styles.segmentTextActive]}>
            {t('Page_Home_EthMode_WebPage')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => selectMode(1)}
          style={[styles.segmentItem, ethMode === 1 && styles.segmentItemActive]}
        >
          <Text numberOfLines={1} style={[styles.segmentText, ethMode === 1 && styles.segmentTextActive]}>
            {t('Page_Home_EthMode_Global')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listRow: { width: '100%', paddingTop: 8, paddingBottom: 12 },
  // 与分流模式保持统一的主/次标题
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
  segmentGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF2FF',
    borderRadius: 24,
    padding: 2,
    borderWidth: 2,
    borderColor: '#D6E4FF',
    width: '100%',
    marginTop: 10,
  },
  segmentItem: {
    flex: 1,
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({ web: { cursor: 'pointer' }, default: {} }),
  },
  segmentItemActive: {
    backgroundColor: '#1890ff',
    shadowColor: '#1890ff',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  segmentText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  segmentTextActive: { color: '#fff' },
});

export default HomeEthMode__forWeb;
