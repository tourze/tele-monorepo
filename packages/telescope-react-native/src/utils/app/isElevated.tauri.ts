// import { invoke } from '@tauri-apps/api/tauri';

async function isElevated__forTauri() {
  // 因为已经找到了BAT的运行方式，所以这里不需要处理了
  return true;
  //return await invoke('is_elevated');
}

export default isElevated__forTauri;
