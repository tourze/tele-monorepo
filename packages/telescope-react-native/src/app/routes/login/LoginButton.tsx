import { useTranslation } from 'react-i18next';
import useSizeTransform from '../../../hooks/useSizeTransform';
import { useNavigation, useRoute } from '@react-navigation/core';
import { View } from 'react-native';
import PrimaryButton from '../../../components/button/PrimaryButton';
import getDeviceModel from '../../../utils/device/getDeviceModel';
import { clearCache as clearRequestCache, fetcher } from '../../hooks/useRequest';
import { API_POST_LOGIN } from '../../constants';
import setTrackingUserId from '../../../utils/tracking/setTrackingUserId';
import Tracking from '../../../utils/tracking/Tracking';
import { set } from '../../../hooks/useStorage';
import DefaultPreference from '../../../utils/app/DefaultPreference';
import updateTsDomains from '../../helpers/updateTsDomains';
import updateTsGfwList from '../../helpers/updateTsGfwList';
import { clearCache } from 'ahooks';
import toastError from '../../../utils/ui/toastError';
import React, { memo, useCallback } from 'react';
import Loading from '../../../utils/ui/Loading';

const LoginButton = ({ email, password }) => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();
  const navigation: any = useNavigation();
  const route: any = useRoute();

  const submitAction = useCallback(async () => {
    await Loading.show('提交中...');

    try {
      const params = {
        username: email,
        password,
        phoneModel: await getDeviceModel(),
      };
      const res = await fetcher(API_POST_LOGIN, params, true);

      await setTrackingUserId(`${res.data.user.id}`);
      Tracking.info('登录成功');

      // 参考旧逻辑，直接存储用户名和密码
      await set('username', email);
      await set('password', password);
      await DefaultPreference.set('username', email);
      await DefaultPreference.set('password', password);

      // 记录token信息
      await set('token', res.data.token);
      await set('expiredIn', res.data.expiredIn);
      await set('user', res.data.user);

      // 登录完成，清除试用标记
      await set('trialLogin', false);

      // 更新域名，要不下次可能打不开
      updateTsDomains();
      // 更新ACL规则
      updateTsGfwList();

      clearRequestCache();
      clearCache();

      // 如果有下一步导航需求（例如从首页点“线路”触发），优先跳转
      const next = route?.params?.next;
      if (next) {
        navigation.replace(next);
      } else {
        navigation.pop();
      }
    } catch (error) {
      toastError(error.message);
    } finally {
      await Loading.hide();
    }
  }, [email, navigation, password, route]);

  return (
    <View
      style={{
        padding: sizeTransform(20),
      }}>
      <PrimaryButton
        onClick={submitAction}
        title={t('Page_Login_LoginButton')}
      />
    </View>
  );
};

export default memo(LoginButton);
