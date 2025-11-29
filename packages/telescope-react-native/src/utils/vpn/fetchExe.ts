import { platform } from '@tauri-apps/plugin-os';

async function fetchExe() {
  const platformName = platform();
  return platformName === 'windows' ? 'sing-box.exe' : 'sing-box';
}

export default fetchExe;
