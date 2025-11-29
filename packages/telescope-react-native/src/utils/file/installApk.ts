import {NativeModules} from 'react-native';

async function installApk(filePath: string) {
  await NativeModules.TTManager.installApk(filePath);
}

export default installApk;
