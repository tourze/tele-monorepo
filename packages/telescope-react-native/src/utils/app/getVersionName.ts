import { memoize } from 'lodash';
import DeviceInfo from 'react-native-device-info';
import { NativeModules } from 'react-native';

const getVersionName = memoize(async function () {
  // return '2.0.1';
  try {
    return await NativeModules.TTManager.getVersionName();
  } catch (e) {
    return DeviceInfo.getVersion();
    // console.error('Failed to get version name:', e);
  }
});

export default getVersionName;
