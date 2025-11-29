import { NativeModules, Platform } from 'react-native';

async function getInstalledPackages() {
  if (Platform.OS === 'android') {
    const {TTManager} = NativeModules;
    return await TTManager.getPackageList();
  }
  return {};
}

export default getInstalledPackages;
