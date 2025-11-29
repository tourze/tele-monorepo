import SSR from 'react-native-shadowsocksr';
import startPing from '../node/startPing';
import toastError from '../ui/toastError';

async function checkPortAvailable(): Promise<boolean> {
  try {
    const latency = await startPing('127.0.0.1', 1080, 1);
    if (typeof latency === 'number') {
      toastError('端口被占用，请关闭占用端口的软件');
      return false;
    }
  } catch {
    // startPing 报错时视为端口可用
    return true;
  }
  return true;
}

// Android 覆盖：优先触发原生授权，附带端口占用检查
async function vpnPrepare_forAndroid(): Promise<boolean> {
  try {
    const ok = await SSR.prepare();
    const portFree = await checkPortAvailable();
    if (!portFree) {
      return false;
    }
    return !!ok;
  } catch {
    return checkPortAvailable();
  }
}

export default vpnPrepare_forAndroid;
