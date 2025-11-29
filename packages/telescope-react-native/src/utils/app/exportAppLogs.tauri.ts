import { invoke } from '@tauri-apps/api/core';
import { appCacheDir, appLogDir, sep } from '@tauri-apps/api/path';
import trimEnd from 'lodash/trimEnd';
import uniq from 'lodash/uniq';

async function exportAppLogsTauri() {
  const logFiles = [];

  const path1 = trimEnd(await appCacheDir(), sep());
  logFiles.push(`${path1}${sep()}*.log`);
  logFiles.push(`${path1}${sep()}*.json`);

  const path2 = trimEnd(await appLogDir(), sep());
  logFiles.push(`${path2}${sep()}*.log`);
  logFiles.push(`${path2}${sep()}*.json`);

  const path3 = trimEnd(await appCacheDir(), sep());
  logFiles.push(`${path3}${sep()}*.log`);
  logFiles.push(`${path3}${sep()}*.json`);

  console.log(logFiles);
  await invoke('plugin:ttmanager|export_app_logs', {
    filePatterns: uniq(logFiles),
    fileName: `加速日志-${(new Date()).getTime()}.zip`,
  });
}

export default exportAppLogsTauri;
