import { memoize } from 'lodash';
import DeviceInfo from 'react-native-device-info';

/**
 * 获取设备型号名，例如 xxx 的 iPhone
 */
const getDeviceName = memoize(async function () {
  return await DeviceInfo.getDeviceName();
});

export default getDeviceName;
