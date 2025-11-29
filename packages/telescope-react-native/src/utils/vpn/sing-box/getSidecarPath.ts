import { path } from '@tauri-apps/api';
import { platform } from '@tauri-apps/plugin-os';
import { exists } from '@tauri-apps/plugin-fs';
import trimEnd from 'lodash/trimEnd';
import memoize from 'lodash/memoize';
import Tracking from '../../tracking/Tracking';

const getSidecarPath = memoize(async function(name: string) {
  const p = platform();

  let resourceDir = await path.resourceDir();
  resourceDir = trimEnd(resourceDir, path.sep());
  Tracking.info('resourceDir', { resourceDir, platform: p });

  // v2开始，获取地址的逻辑变了...
  if (p === 'windows') {
    const ext = name.endsWith('.exe') ? '' : '.exe';
    return `${resourceDir}${path.sep()}${name}${ext}`;
  }

  let sidecarPath = await path.resolveResource(name);

  // 修复路径不存在的问题
  if (!await exists(sidecarPath)) {
    // 修复MacOS下的路径错误问题
    if (p === 'macos') {
      sidecarPath = sidecarPath.replace('/Resources/', '/MacOS/');
    }
  }

  console.log('Sidecar Path:', sidecarPath);
  return sidecarPath;
});

export default getSidecarPath;
