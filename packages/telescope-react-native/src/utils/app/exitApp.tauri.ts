import {exit} from '@tauri-apps/plugin-process';

async function exitApp__forTauri() {
  await exit(1);
}

export default exitApp__forTauri;
