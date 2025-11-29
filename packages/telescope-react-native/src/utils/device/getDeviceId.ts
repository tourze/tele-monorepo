import { memoize } from 'lodash';
import DeviceInfo from 'react-native-device-info';
import { NativeModules } from 'react-native';

const getDeviceId = memoize(async function () {
  try {
    const {TTManager} = NativeModules;
    return await TTManager.getHardwareUUID();
  } catch (err) {
    // iOS: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
    // Android: "dd96dec43fb81c97"
    // Windows: "{2cf7cb3c-da7a-d508-0d7f-696bb51185b4}"
    return await DeviceInfo.getUniqueId();
  }
});

export default getDeviceId;
