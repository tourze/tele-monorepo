import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import { useDebounceFn } from 'ahooks';
import Tracking from '../utils/tracking/Tracking';
import useSizeTransform from '../hooks/useSizeTransform';
import useStorage from '../hooks/useStorage';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    marginTop: -100,
  },
});

const friendlyMessages: any = {
  'Network request failed': '网络节点不稳定，请尝试进入个人中心→关于我们→重新检查API环境',
  'Request Timeout': '网络不稳定，请尝试重启APP或更换网络',
};

function formatMsg(text: string) {
  return friendlyMessages[text] === undefined ? text : friendlyMessages[text];
}

function Error({error}: any) {
  Tracking.info('CatchError捕捉到异常', {
    error,
  });

  const {t} = useTranslation();

  const sizeTransform = useSizeTransform();
  //const pathRedirect = usePathRedirect();
  const {data: config} = useStorage('config');

  const clickBottomKefu = useDebounceFn(function () {
    Tracking.info('错误组件-点击客服', config);
    // if (config?.cardMoreUrl) {
    //   // 参考 https://help.crisp.chat/en/article/how-can-i-embed-the-crisp-chatbox-in-an-external-link-or-an-iframe-bkfh98/
    //   pathRedirect(config.cardMoreUrl === TelegramKefuLink
    //     ? {
    //       path: `webview:${CrispLink}`,
    //       title: t('OnlineKefu'),
    //     }
    //     : config.cardMoreUrl);
    // }
  }, { leading: true, trailing: false });

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/error.png')}
        fadeDuration={0}
        style={styles.logo}
      />
      <Text style={{marginTop: -60, color: 'red'}}>
        {error ? formatMsg(error.message) : t('Component_Error_DefaultMessage')}
      </Text>
      <Pressable onPress={clickBottomKefu.run}>
        <Text style={{paddingTop: sizeTransform(20)}}>
          {t('Component_Error_SnapToKefu')}
        </Text>
      </Pressable>
    </View>
  );
}

export default React.memo(Error);
