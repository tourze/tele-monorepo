import PrimaryButton from '../../../components/button/PrimaryButton';
import getDeviceModel from '../../../utils/device/getDeviceModel';
import { clearCache as clearRequestCache, fetcher } from '../../hooks/useRequest';
import { API_POST_BIND_ACCOUNT } from '../../constants';
import setTrackingUserId from '../../../utils/tracking/setTrackingUserId';
import Tracking from '../../../utils/tracking/Tracking';
import setStorageItem from '../../../utils/storage/setStorageItem';
import DefaultPreference from '../../../utils/app/DefaultPreference';
import { set } from '../../../hooks/useStorage';
import { clearCache, useDebounceFn } from 'ahooks';
import toastError from '../../../utils/ui/toastError';
import { View } from 'react-native';
import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import useSizeTransform from '../../../hooks/useSizeTransform';
import { useNavigation, useRoute } from '@react-navigation/core';

function RegButton({ email, password, verificationCode }) {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();
  const navigation: any = useNavigation();
  const route: any = useRoute();

  const clickAction = useDebounceFn(async () => {
    try {
      const params: any = {
        username: email,
        password,
        passwordConfirmation: password,
        phoneModel: await getDeviceModel(),
      };
      // 仅当是邮箱注册时才需要验证码
      if (isEmail(email)) {
        params.captcha = verificationCode;
      }
      const res = await fetcher(API_POST_BIND_ACCOUNT, params);

      await setTrackingUserId(`${res.data.user.id}`);
      Tracking.info('注册成功');

      // 参考旧逻辑，直接存储用户名和密码
      await setStorageItem('username', email);
      await setStorageItem('password', password);
      await DefaultPreference.set('username', email);
      await DefaultPreference.set('password', password);

      // 记录token信息
      await set('token', res.data.token);
      await set('expiredIn', res.data.expiredIn);
      await set('user', res.data.user);

      // 注册完成，清除试用标记
      await set('trialLogin', false);

      clearRequestCache();
      clearCache();

      const next = route?.params?.next;
      if (next) {
        navigation.replace(next);
      } else {
        navigation.pop();
      }
    } catch (error) {
      Tracking.info('注册失败', { error });
      toastError(error.message);
    }
  }, { leading: true, trailing: false });

  return (
    <View
      style={{
        padding: sizeTransform(20),
      }}>
      <PrimaryButton
        onClick={clickAction.run}
        title={t('Page_Login_RegisterButton')}
      />
    </View>
  );
}

export default memo(RegButton);
const isEmail = require('is-email');
