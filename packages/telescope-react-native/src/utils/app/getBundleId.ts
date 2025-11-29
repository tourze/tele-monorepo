import DeviceInfo from 'react-native-device-info';

async function getBundleId() {
  return DeviceInfo.getBundleId();
}

export default getBundleId;
