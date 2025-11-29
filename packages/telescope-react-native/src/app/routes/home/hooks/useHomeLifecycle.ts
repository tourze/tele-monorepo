import { useCallback, useEffect } from 'react';
import { BackHandler, DeviceEventEmitter, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import Loading from '../../../../utils/ui/Loading';
import checkTsAppVersion from '../checkTsAppVersion';
import { sessionFlags, SESSION_FLAG_KEYS } from '../../../../utils/session/sessionFlags';

type UseHomeLifecycleParams = {
  navigation: any;
  route: any;
};

const onBackPress = () => true;

const useHomeLifecycle = ({ navigation, route }: UseHomeLifecycleParams) => {
  // 注册提醒优化：启动时仅检测一次，重启应用才会下一轮判断
  useEffect(() => {
    if (route?.params?.promptTrialLogin) {
      // 检查是否已经在本次应用会话中弹出过提醒
      if (!sessionFlags.has(SESSION_FLAG_KEYS.TRIAL_LOGIN_PROMPTED)) {
        // 设置标志位，防止本次会话重复弹出
        sessionFlags.set(SESSION_FLAG_KEYS.TRIAL_LOGIN_PROMPTED);
        // 弹出登录提醒
        navigation.push('Login', { allowSkip: true });
      }
    }
  }, [navigation, route?.params?.promptTrialLogin]);

  useEffect(() => {
    Loading.hide();
    checkTsAppVersion();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let subscription;
      if (Platform.OS !== 'web') {
        subscription = BackHandler.addEventListener(
          'hardwareBackPress',
          onBackPress,
        );
      }
      return () => {
        subscription && subscription.remove();
      };
    }, []),
  );

  useEffect(() => {
    if (DeviceEventEmitter) {
      DeviceEventEmitter.emit('ENTER_HOME');
    }
  }, []);
};

export default useHomeLifecycle;
