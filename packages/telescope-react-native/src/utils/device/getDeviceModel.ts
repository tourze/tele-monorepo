import { memoize } from 'lodash';
import DeviceInfo from 'react-native-device-info';

/**
 * 获取设备型号信息
 */
const getDeviceModel = memoize(async function () {
  return DeviceInfo.getModel();
});

export default getDeviceModel;
