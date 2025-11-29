import {Command} from '@tauri-apps/plugin-shell';
import Tracking from '../tracking/Tracking';
import { platform } from '@tauri-apps/plugin-os';

const quote = require('shell-quote/quote');

async function spawn__forTauri(
  program: string,
  args: string[],
  options: any = {},
): Promise<number> {
  const cmd = quote([program, ...args]);
  //console.log(`spawn__forTauri：${cmd}`);

  const isSidecar = options.sidecar === undefined ? false : !!options.sidecar;
  delete options.sidecar;
  options.encoding = platform() === 'windows' ? 'gbk' : 'utf8';

  Tracking.info('spawn执行', { program, args, isSidecar });
  let command = Command.create(program, args, options);
  if (isSidecar) {
    command = Command.sidecar(program, args, options);
  }

  command.on('error', (error: any) => {
    Tracking.info(`spawn command error`, {
      error,
      program,
      args,
      options,
    });
  });

  const child = await command.spawn();
  const pid = child.pid;
  Tracking.info(`spawn__forTauri结果，【${cmd}】，pid：${pid}`, {
    program,
    args,
    options,
  });
  return pid;
}

export default spawn__forTauri;
