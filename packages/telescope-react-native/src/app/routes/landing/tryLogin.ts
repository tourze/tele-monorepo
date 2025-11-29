import {Platform} from 'react-native';
import {set} from '../../../hooks/useStorage';
import {fetcher} from '../../hooks/useRequest';
import {API_POST_LOGIN, API_POST_TRIAL_LOGIN} from '../../constants';
import getDeviceModel from '../../../utils/device/getDeviceModel';
import getDeviceId from '../../../utils/device/getDeviceId';
import getStorageItem from '../../../utils/storage/getStorageItem';
import removeStorageItem from '../../../utils/storage/removeStorageItem';
import setTrackingUserId from '../../../utils/tracking/setTrackingUserId';
import Tracking from '../../../utils/tracking/Tracking';
import DefaultPreference from '../../../utils/app/DefaultPreference';

/**
 * 尝试登录
 * 如果没登录，就走试用登录流程
 *
 * @returns {Promise<void>}
 */
async function tryLogin() {
  let username: string|null = await DefaultPreference.get('username');
  if (username === null) {
    username = await getStorageItem('username');
  }

  let res;
  let isTrialLogin = false; // 是否为试用登录
  if (username) {
    await setTrackingUserId(username);

    let password: string|null = await DefaultPreference.get('password');
    if (password === null) {
      password = await getStorageItem('password');
    }

    try {
      // 走常规的登录流程
      res = await fetcher(
        API_POST_LOGIN,
        {
          username,
          password,
          phoneModel: await getDeviceModel(),
        },
        true,
      );
    } catch (error) {
      Tracking.info('常规tryLogin失败', {
        error,
      });
      // 登录失败，我们就去除本地记录的用户信息
      removeStorageItem('username');
      removeStorageItem('password');
      throw error;
    }
  } else {
    // 走试用登录流程
    const params: any = {
      phoneModel: await getDeviceModel(),
      imei: await getDeviceId(),
    };
    if (Platform.OS === 'android') {
      params.app_sh1 = '9F260C0CD653C24DFED352B5743F41A3EAE4DB9C';
    }
    params.native_current_imei = '';
    params.native_init_imei = '';
    res = await fetcher(API_POST_TRIAL_LOGIN, params, true);
    isTrialLogin = true;
  }

  // 重新设置一次
  Tracking.info('tryLogin res', res);
  await setTrackingUserId(`${res.data.user.id}`);

  // 记录token信息
  await set('token', res.data.token);
  await set('expiredIn', res.data.expiredIn);
  await set('user', res.data.user);

  // 记录是否为试用态，供后续引导判断
  await set('trialLogin', isTrialLogin);
}

export default tryLogin;
