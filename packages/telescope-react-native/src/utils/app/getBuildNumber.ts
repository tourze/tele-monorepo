import DeviceInfo from 'react-native-device-info';

async function getBuildNumber() {
  return DeviceInfo.getBuildNumber();
}

export default getBuildNumber;
