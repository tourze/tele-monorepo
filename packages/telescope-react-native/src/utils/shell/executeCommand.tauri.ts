import {Command} from '@tauri-apps/plugin-shell';
import { platform } from '@tauri-apps/plugin-os';
import {quote} from 'shell-quote';
import Tracking from '../tracking/Tracking';

async function executeCommand__forTauri(
  str: string,
  args: string[] = [],
): Promise<string> {
  const cmd = quote([str, ...args]);
  // Tracking.info('准备执行命令', {
  //   program: str,
  //   args,
  //   cmd,
  // });

  try {
    Tracking.info('execute执行', { program: str, args });
    const command = Command.create(str, args, {
      // win下的中文获取有问题，参考 https://github.com/tauri-apps/tauri/issues/4644 这里改用gbk
      encoding: platform() === 'windows' ? 'gbk' : 'utf8',
    });
    const child = await command.execute();
    Tracking.info('执行命令成功', {
      program: str,
      args,
      cmd,
      stdout: child.stdout,
      code: child.code,
    });
    return child.stdout;
  } catch (error) {
    Tracking.info('执行命令时发生错误', {
      cmd,
      error,
    });
    throw error;
  }
}

export default executeCommand__forTauri;
