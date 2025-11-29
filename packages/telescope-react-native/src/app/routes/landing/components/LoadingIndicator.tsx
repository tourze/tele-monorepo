import React, {memo, useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
/* eslint-disable import/namespace */
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
/* eslint-enable import/namespace */

import useSizeTransform from '../../../../hooks/useSizeTransform';
import useWindowHeight from '../../../../hooks/useWindowHeight';
import {Button} from '../../../../react-native-ui-kitten/components';
import exitApp from '../../../../utils/app/exitApp';
import disableOsProxy from '../../../../utils/disableOsProxy';
import Tracking from '../../../../utils/tracking/Tracking';

interface LoadingIndicatorProps {
  versionName?: string;
  networkOk: boolean;
  networkNotice: string | null;
}

/**
 * 加载指示器组件
 *
 * 职责：
 * 1. 显示应用 Logo 和版本信息
 * 2. 显示网络状态和提示信息
 * 3. 提供退出应用的交互
 *
 * 优化：使用 memo 避免不必要的重渲染，使用 useMemo 缓存样式
 */
export const LoadingIndicator = memo<LoadingIndicatorProps>(
  ({versionName, networkOk, networkNotice}) => {
    const {t} = useTranslation();
    const sizeTransform = useSizeTransform();
    const windowHeight = useWindowHeight();

    // 缓存回调函数
    const handleLogoPress = useCallback(async () => {
      // 如果已经确定无效了，点击ICON就退出吧
      if (!networkOk) {
        await disableOsProxy();
        exitApp();
      }
    }, [networkOk]);

    const handleExitPress = useCallback(async () => {
      Tracking.info('点击退出应用');
      await disableOsProxy();
      exitApp();
    }, []);

    // 缓存动态样式
    const centerContainerStyle = useMemo(
      () => ({
        height: windowHeight,
        display: 'flex' as const,
        flexDirection: 'column' as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      }),
      [windowHeight]
    );

    const logoStyle = useMemo(
      () => ({
        width: sizeTransform(200),
        height: sizeTransform(200),
      }),
      [sizeTransform]
    );

    const networkFailedTextStyle = useMemo(
      () => ({
        marginTop: sizeTransform(10),
        color: 'red',
      }),
      [sizeTransform]
    );

    const noticeTextStyle = useMemo(
      () => ({
        marginTop: sizeTransform(10),
      }),
      [sizeTransform]
    );

    const exitButtonContainerStyle = useMemo(
      () => ({
        padding: sizeTransform(20),
      }),
      [sizeTransform]
    );

    return (
      <View style={centerContainerStyle}>
        {/* Logo */}
        <Pressable onPress={handleLogoPress}>
          <Image
            source={require('../../../images/logo_Telescope512.png')}
            fadeDuration={0}
            style={logoStyle}
          />
        </Pressable>

        {/* 版本信息 */}
        {versionName && <Text style={styles.versionText}>v{versionName}</Text>}

        {/* 网络状态文本 */}
        {networkOk ? (
          <Text style={styles.networkOkText}>
            {t('Page_Landing_NetworkOk_Text')}
          </Text>
        ) : (
          <Text style={networkFailedTextStyle}>
            {t('Page_Landing_NetworkFailed_Text')}
          </Text>
        )}

        {/* 提示信息 */}
        {networkNotice ? (
          <Text style={noticeTextStyle}>{networkNotice}</Text>
        ) : null}

        {/* 退出按钮 */}
        {!networkOk && (
          <View style={exitButtonContainerStyle}>
            <Button onPress={handleExitPress}>{t('Exit_App')}</Button>
          </View>
        )}
      </View>
    );
  }
);

LoadingIndicator.displayName = 'LoadingIndicator';

const styles = StyleSheet.create({
  versionText: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.3)',
  },
  networkOkText: {
    marginTop: 3,
  },
});
