import { memoize } from 'lodash';
import { NativeModules } from 'react-native';

const getChannelName = memoize(async function () {
  try {
    const {TTManager} = NativeModules;
    // 默认官网渠道
    const res = await TTManager.getChannelName();
    return res ? res : 'GW';
  } catch (e) {
    return 'GW';
  }
});

export default getChannelName;
