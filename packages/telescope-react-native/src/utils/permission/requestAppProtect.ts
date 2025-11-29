import { Platform } from 'react-native';
import SendIntentAndroid from 'react-native-send-intent';
import notifee from '@notifee/react-native';
import AlertAsync from 'react-native-alert-async';
import Tracking from '../tracking/Tracking';
import toastWarn from '../ui/toastWarn';
import getStorageItem from '../storage/getStorageItem';
import setStorageItem from '../storage/setStorageItem';

const cacheKey = 'requestAppProtect_forAndroid_hasPop';

async function requestAppProtect_forAndroid(): Promise<boolean> {
  // 减少困扰，下面的逻辑只执行一次喔
  const hasPop = await getStorageItem(cacheKey);
  if (hasPop) {
    return false;
  }

  try {
    const r = await SendIntentAndroid.requestIgnoreBatteryOptimizations();
    Tracking.info('requestIgnoreBatteryOptimizations', {
      status: r,
    });
    if (r) {
      return true;
    }
    // return r;
  } catch (error) {
    Tracking.info('requestIgnoreBatteryOptimizations', {
      status: false,
      error,
    });

    toastWarn('申请忽略电池节电失败，锁屏后应用可能被关！');
  }

  // 1. checks if battery optimization is enabled
  const batteryOptimizationEnabled =
    await notifee.isBatteryOptimizationEnabled();
  if (batteryOptimizationEnabled) {
    // 2. ask your users to disable the feature
    try {
      await AlertAsync(
        '遇到一些权限问题',
        '为确保应用在长时间使用时流量不中断，我们需要忽略电池节电权限',
        [
          // 3. launch intent to navigate the user to the appropriate screen
          {
            text: '好的，去设置',
            onPress: async () => {
              await notifee.openBatteryOptimizationSettings();
              return 'yes';
            },
          },
          {
            text: '取消',
            onPress: () => {
              return 'no';
            },
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } catch (err) {}
  }

  // 运营反馈这个权限有点不明所以，暂时屏蔽了
  // // 1. get info on the device and the Power Manager settings
  // const powerManagerInfo = await notifee.getPowerManagerInfo();
  // if (powerManagerInfo.activity) {
  //   // 2. ask your users to adjust their settings
  //   try {
  //     await AlertAsync(
  //       '遇到一些权限问题',
  //       '为确保应用在长时间使用时流量不中断，我们需要确保应用不被误杀',
  //       [
  //         // 3. launch intent to navigate the user to the appropriate screen
  //         {
  //           text: '好的，去设置',
  //           onPress: async () => {
  //             await notifee.openPowerManagerSettings();
  //             return 'yes';
  //           },
  //         },
  //         {
  //           text: '取消',
  //           onPress: () => {
  //             return 'no';
  //           },
  //           style: 'cancel',
  //         },
  //       ],
  //       {cancelable: false},
  //     );
  //   } catch (err) {}
  // }

  await setStorageItem(cacheKey, '1');
  return false;
}

async function requestAppProtect(): Promise<boolean> {
  if (Platform.OS === 'android') {
    return await requestAppProtect_forAndroid();
  }
  return false;
}

export default requestAppProtect;
