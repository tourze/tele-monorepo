import { memoize } from 'lodash';
import DeviceInfo from 'react-native-device-info';

const getAppName = memoize(async () => {
  return DeviceInfo.getApplicationName();
});

export default getAppName;
