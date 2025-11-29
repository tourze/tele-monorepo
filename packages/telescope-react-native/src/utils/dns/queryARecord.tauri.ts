import { platform } from '@tauri-apps/plugin-os';
import winVersion from './queryARecord.windows';
import macVersion from './queryARecord.macos';

const queryARecord__forTauri = async function (host: string): Promise<string[]> {
  const platformName = platform();
  if (platformName === 'windows') {
    return await winVersion(host);
  }
  if (platformName === 'macos') {
    return await macVersion(host);
  }
  return [];
};

export default queryARecord__forTauri;
