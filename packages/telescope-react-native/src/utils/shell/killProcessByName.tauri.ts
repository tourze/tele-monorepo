import { platform } from '@tauri-apps/plugin-os';
import { invoke } from '@tauri-apps/api/core';
import sleep from '@anmiles/sleep';
import Tracking from '../tracking/Tracking';
import countProcessByName from './countProcessByName';

/**
 * macos下的杀进程兼容，要提高权限
 *
 * @param processName
 */
async function killAllProcesses__MacOS(processName: string) {
  try {
    const script = `
      tell application "System Events"
        set processList to name of every process whose name is "${processName}"
        repeat with proc in processList
          try
            do shell script "killall " & quoted form of proc
          end try
        end repeat
      end tell
    `;

    await invoke('plugin:ttmanager|run_osascript', { script });
    console.log(`Successfully killed all processes named: ${processName}`);
  } catch (error) {
    console.error(`Failed to kill processes named ${processName}:`, error);
  }
}

async function killProcessByName__forTauri(processName: string): Promise<boolean> {
   const platformName = platform();

  let count = 0;
  try {
    try {
      count = await invoke('plugin:ttmanager|kill_processes_by_name', {processName});
    } catch (error) {
      Tracking.info('杀进程时遇到异常', {
        processName,
        error,
      });
      count = 0;
    }

    // 如果失败的话，我们尝试使用root权限来杀
    if (count === 0 && platformName === 'macos') {
      await killAllProcesses__MacOS(processName);
      // 重新计算一次数量
      await sleep(500);
      count = (await countProcessByName(processName)) > 0 ? 0 : 1;
    }
  } catch (error) {
    Tracking.info('Failed to kill processes:', {
      error,
      processName,
    });
  }

  // 没杀成功，还要继续想办法
  if (count === 0) {
    // TODO
  }

  return count > 0;
}

export default killProcessByName__forTauri;
