import { invoke } from '@tauri-apps/api/core';
import Tracking from '../tracking/Tracking';
import fetchExe from './fetchExe';

const vpnStatus__forTauri = async function () {
  const processName = await fetchExe();
  try {
    const count = await invoke('plugin:ttmanager|count_processes_by_name', {processName});
    return parseInt(count as string, 10) > 0;
  } catch (error) {
    Tracking.info('Failed to count processes:', {
      error,
      processName,
    });
    return false;
  }
};

export default vpnStatus__forTauri;
