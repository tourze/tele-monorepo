import { platform } from '@tauri-apps/plugin-os';
import { memoize } from 'lodash';

const getHttpProxyPort = memoize(async () => {
  const platformName = platform();
  if (platformName === 'windows') {
    return 2712;
  }
  return 1191;
});

export default getHttpProxyPort;
