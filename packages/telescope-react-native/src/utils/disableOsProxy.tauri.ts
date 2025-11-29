import { invoke } from '@tauri-apps/api/core';
import Tracking from '../utils/tracking/Tracking';

async function disableOsProxy__forTauri() {
  try {
    await invoke('plugin:ttmanager|disable_os_proxy');
  } catch (error) {
    Tracking.info('关闭系统代理出错', {
      error,
    });
  }
}

export default disableOsProxy__forTauri;
