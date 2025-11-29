import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

async function isSafeEnv() {
  if (!__DEV__) {
    // 模拟器用户，都应该是不安全的
    if (Platform.OS === 'android' && await DeviceInfo.isEmulator()) {
      return false;
    }
  }
  // 默认当作环境是安全的
  return true;
}

export default isSafeEnv;
