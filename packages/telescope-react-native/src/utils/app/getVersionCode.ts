import {NativeModules} from 'react-native';
import { memoize } from 'lodash';

const getVersionCode = memoize(async function () {
  // return '201';
  try {
    return await NativeModules.TTManager.getVersionCode();
  } catch (e) {
    console.error('TTManager.getVersionCode error', e);
  }
  return '';
});

export default getVersionCode;
