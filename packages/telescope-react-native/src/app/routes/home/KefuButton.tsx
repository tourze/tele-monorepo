import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import React, { memo } from 'react';
import { useDebounceFn } from 'ahooks';
import Tracking from '../../../utils/tracking/Tracking';
import { CrispLink } from '../../constants';
import usePathRedirect from '../../helpers/usePathRedirect';
import { useTranslation } from 'react-i18next';

function KefuButton() {
  const pathRedirect = usePathRedirect();
  const {t} = useTranslation();

  const clickBottomKefu = useDebounceFn(() => {
    Tracking.info('首页-点击底部客服');
    if (CrispLink) {
      // 参考 https://help.crisp.chat/en/article/how-can-i-embed-the-crisp-chatbox-in-an-external-link-or-an-iframe-bkfh98/
      pathRedirect({
        path: `webview:${CrispLink}`,
        title: t('OnlineKefu'),
      });
    }
  }, { leading: true, trailing: false });

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={clickBottomKefu.run}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10,
      }}>
      <Text style={styles.kefuText}>
        {t('Page_Home_ContactKefuNotice')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  kefuText: {
    color: '#4dabf7',
  },
});

export default memo(KefuButton);
