import { platform } from '@tauri-apps/plugin-os';
import { memoize } from 'lodash';

const getSocks5ProxyPort = memoize(async () => {
  const platformName = platform();
  if (platformName === 'windows') {
    return 2711;
  }
  return 1190;
});

export default getSocks5ProxyPort;
