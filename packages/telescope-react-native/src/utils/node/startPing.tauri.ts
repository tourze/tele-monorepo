import { invoke } from '@tauri-apps/api/core';

async function startPing__forTauri(
  ip: string,
  port: number,
  times: number,
): Promise<number | null> {
  try {
    const averageDuration = await invoke('plugin:ttmanager|tcping', {
      host: ip,
      port: port,
      count: times,
    });
    return parseInt(averageDuration as string, 10);
  } catch (e) {
    console.error('调用 Rust tcping 命令时出错:', e);
    return null;
  }
}

export default startPing__forTauri;
