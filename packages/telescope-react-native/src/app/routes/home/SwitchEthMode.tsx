import React from 'react';
import {View, StyleSheet, Switch, Text} from 'react-native';
import useStorage from '../../../hooks/useStorage';
import useSizeTransform from '../../../hooks/useSizeTransform';
import {useTranslation} from 'react-i18next';

const SwitchEthMode = () => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  // 0网页 1网卡，一般只有PC才会关心这个
  const {data: ethMode} = useStorage('ethMode', 0);

  return (
    <View
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: sizeTransform(20),
        // paddingBottom: sizeTransform(20),
      }}>
      <View style={styles.ethItem}>
        <Switch value={ethMode === 0} />
        <Text>{t('Page_Home_EthMode_WebPage')}</Text>
      </View>
      <View style={styles.ethItem}>
        <Switch value={ethMode === 1} />
        <Text>{t('Page_Home_EthMode_Global')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ethItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default SwitchEthMode;
