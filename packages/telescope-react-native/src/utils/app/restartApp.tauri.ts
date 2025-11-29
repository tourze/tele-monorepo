import {relaunch} from '@tauri-apps/plugin-process';

async function restartApp() {
  await relaunch();
}

export default restartApp;
