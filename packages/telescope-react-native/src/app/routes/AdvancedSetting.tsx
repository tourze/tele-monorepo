import React from 'react';
import {StyleSheet, View, Text, StatusBar, Switch} from 'react-native';
import Divider from '../../components/Divider';
import {useTranslation} from 'react-i18next';
import useStorage from '../../hooks/useStorage';
import useSizeTransform from '../../hooks/useSizeTransform';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import Tracking from '../../utils/tracking/Tracking';
import {ListItem} from '../../react-native-ui-kitten/components';
import { useDebounceFn } from 'ahooks';

const AdvancedSettingPage = () => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  // 游戏模式，其实就是是否开启UDP
  const {data: udpRelay, update: setUdpRelay} = useStorage('udpRelay', false);
  const switchUDP = useDebounceFn(async () => {
    const newVal = !udpRelay;
    Tracking.info('切换UDP开关', {
      newVal,
    });
    await setUdpRelay(newVal);
  }, { leading: true, trailing: false });

  // 开启详细日志
  const {data: detailLog, update: setDetailLog} = useStorage('detailLog', false);
  const switchDetailLog = useDebounceFn(async () => {
    const newVal = !detailLog;
    await setDetailLog(newVal);
  }, { leading: true, trailing: false });

  // TODO 支持选择指定应用

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      <ListItem
        title={t('Page_Home_UDP_Support_Title')}
        description={t('Page_Home_UDP_Support_Desc')}
        onPress={switchUDP.run}
        accessoryRight={() => {
          return (
            <Switch
              //style={styles.toggle}
              value={!!udpRelay}
              onChange={async () => {
                await setUdpRelay(!udpRelay);
              }}
            />
          );
        }}
      />
      <Divider />

      <ListItem
        title='详细日志'
        description='开启后会记录详细日志，用于排查问题'
        onPress={switchDetailLog.run}
        accessoryRight={() => {
          return (
            <Switch
              //style={styles.toggle}
              value={!!detailLog}
              onChange={async () => {
                await setDetailLog(!detailLog);
              }}
            />
          );
        }}
      />
      <Divider />

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: sizeTransform(30),
        }}>
        <Text style={{color: '#339af0'}}>{t('Page_Home_Switch_Notice')}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
});

export default withErrorBoundary(AdvancedSettingPage, {
  FallbackComponent: CatchError,
});
