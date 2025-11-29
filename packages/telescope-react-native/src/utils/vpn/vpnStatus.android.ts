import SSR from 'react-native-shadowsocksr';

/**
 * 只返回了两个状态，true/false
 */
async function vpnStatus_forAndroid() {
  try {
    const s = await SSR.status();
    if (typeof s === 'string') {
      return s.toUpperCase() === 'CONNECTED' || s === '1' || s === 'true';
    }
  } catch {}
  return false;
}

export default vpnStatus_forAndroid;
