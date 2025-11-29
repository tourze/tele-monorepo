import { platform } from '@tauri-apps/plugin-os';
import { memoize } from 'lodash';

const getPlatform__forTauri = memoize(async function () {
  const res = platform();
  if (res === 'macos') {
    // TODO 历史兼容问题了。。
    return 'mac';
  }
  return res;
});

export default getPlatform__forTauri;
