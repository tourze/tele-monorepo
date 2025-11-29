import SSR from 'react-native-shadowsocksr';

async function vpnStatus_forIOS() {
  try {
    const s = await SSR.status();
    if (typeof s === 'string') {
      return s.toUpperCase() === 'CONNECTED' || s === '1' || s === 'true';
    }
  } catch {}
  return false;
}

export default vpnStatus_forIOS;
