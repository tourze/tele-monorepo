import { memoize } from 'lodash';
import DeviceInfo from 'react-native-device-info';

const getSystemVersion = memoize(async function () {
  return DeviceInfo.getSystemVersion();
});

export default getSystemVersion;
