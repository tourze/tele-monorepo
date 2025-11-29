import SSR from 'react-native-shadowsocksr';

async function vpnStop_forIOS() {
  try {
    return !!(await SSR.stop());
  } catch {
    return false;
  }
}

export default vpnStop_forIOS;
