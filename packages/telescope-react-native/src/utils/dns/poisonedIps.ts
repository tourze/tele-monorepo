import {isIPv4} from 'is-ip';
import privateIp from 'private-ip';

export function checkSuspiciousIp(ip: string): string | null {
  if (__DEV__) {
    // 开发环境允许 Fake IP，跳过过滤
    return null;
  }
  if (!isIPv4(ip)) {
    return '非 IPv4 地址';
  }
  if (privateIp(ip)) {
    return '私有/保留地址';
  }
  const firstOctet = Number(ip.split('.')[0]);
  if (Number.isNaN(firstOctet) || firstOctet === 0 || firstOctet === 127 || firstOctet === 255 || firstOctet >= 240) {
    return '保留或不可达网段';
  }
  return null;
}

export default checkSuspiciousIp;
