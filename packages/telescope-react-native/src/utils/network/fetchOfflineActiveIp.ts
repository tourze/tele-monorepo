import { NativeModules } from 'react-native';

/**
 * 获取一个可能有效，但是还没被使用的IP
 *
 * @param ipAddress
 */
async function fetchOfflineActiveIp(ipAddress: string) {
  const parts = ipAddress.split(".");
  const prefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
  const {TTManager} = NativeModules;

  for (let i = 2; i < 255; i++) {
    const newIP = `${prefix}.${i}`;
    if (newIP === ipAddress) {
      continue;
    }

    const alive = await TTManager.pingIpAddress(newIP);
    if (alive) {
      continue;
    }
    return newIP;
  }

  throw new Error('找不到有效可用的IP地址');
}

export default fetchOfflineActiveIp;
