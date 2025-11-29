import hostToIp from '../network/hostToIp';
import { get } from '../../hooks/useStorage';
import SSR from 'react-native-shadowsocksr';

async function vpnStart_forIOS(node: any) {
  const newNode = { ...node };
  newNode.ip = await hostToIp(newNode.ip);

  // 0 智能（默认服务器）；1 全局（all）
  const proxyMode = parseInt(await get('proxyMode', 0), 10);
  let route = 'default-server';
  if (proxyMode === 1) route = 'all';

  try {
    await SSR.prepare();
  } catch {}

  try {
    const ok = await SSR.start({
      host: newNode.ip,
      port: newNode.port,
      password: newNode.passwd ?? newNode.password,
      method: newNode.method,
      protocol: newNode.protocol,
      protocolParam: newNode.protoparam ?? newNode.protocolParam,
      obfs: newNode.obfs,
      obfsParam: newNode.obfsparam ?? newNode.obfsParam,
      route,
      udpdns: false,
    });
    return !!ok;
  } catch {
    return false;
  }
}

export default vpnStart_forIOS;
