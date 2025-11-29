import React from 'react';
import {StyleSheet, View, Text, StatusBar} from 'react-native';
import {useTranslation} from 'react-i18next';
import useSizeTransform from '../../hooks/useSizeTransform';
import { useDebounceFn } from 'ahooks';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import openAppSetting from '../../utils/app/openAppSetting';
import PrimaryButton from '../../components/button/PrimaryButton';
import requestAppProtect from '../../utils/permission/requestAppProtect';

const NetworkProtectPage = () => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  const goAction = useDebounceFn(async () => {
    await requestAppProtect();
    await openAppSetting();
  }, { leading: true, trailing: false });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: sizeTransform(36),
        }}>
        <Text
          style={{
            marginBottom: sizeTransform(20),
            fontSize: sizeTransform(30),
            fontWeight: 'bold',
          }}>
          {t('Page_NetworkProtect_WhyNeed_Title')}
        </Text>
        <Text>{t('Page_NetworkProtect_WhyNeed_Desc')}</Text>
        <Text
          style={{
            marginTop: sizeTransform(10),
            fontWeight: 'bold',
          }}>
          {t('Page_NetworkProtect_WhyNeed_Security_Notice')}
        </Text>
        <Text>{t('Page_NetworkProtect_WhyNeed_Security_Desc')}</Text>

        <Text
          style={{
            marginBottom: sizeTransform(20),
            marginTop: sizeTransform(20),
            fontSize: sizeTransform(30),
            fontWeight: 'bold',
          }}>
          {t('Page_NetworkProtect_Setting_Title')}
        </Text>
        <Text>{t('Page_NetworkProtect_Setting_Line1')}</Text>
        <Text>{t('Page_NetworkProtect_Setting_Line2')}</Text>
        <Text>{t('Page_NetworkProtect_Setting_Line3')}</Text>
      </View>

      <View
        style={{
          paddingLeft: sizeTransform(36),
          paddingRight: sizeTransform(36),
        }}>
        <PrimaryButton
          title={t('Page_NetworkProtect_GoSetting')}
          onClick={goAction.run}
        />
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

export default withErrorBoundary(NetworkProtectPage, {
  FallbackComponent: CatchError,
});
