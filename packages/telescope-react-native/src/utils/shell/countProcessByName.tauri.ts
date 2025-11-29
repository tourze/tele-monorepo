import { invoke } from '@tauri-apps/api/core';

async function countProcessByName__forTauri(processName: string) {
  return await invoke('plugin:ttmanager|count_processes_by_name', {processName});
}

export default countProcessByName__forTauri;
