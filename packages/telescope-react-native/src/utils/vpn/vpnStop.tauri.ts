import { BaseDirectory, remove } from '@tauri-apps/plugin-fs';
import { fetch } from '@tauri-apps/plugin-http';
import { platform } from '@tauri-apps/plugin-os';
import { SingBoxConfigFileName } from '../../config';
import killProcessByName from '../shell/killProcessByName';
import Tracking from '../tracking/Tracking';
import countProcessByName from '../shell/countProcessByName';
import sleep from '@anmiles/sleep';
import disableOsProxy from '../disableOsProxy';
import fetchExe from './fetchExe';
import executeCommand from '../shell/executeCommand';

const vpnStop__forTauri = async function () {
  const platformName = platform();
  if (platformName === 'macos') {
    // 旧服务我们也需要关闭了啊，要不会端口占用。。
    const oldServices = [
      'com.shadow.telescope.local',
      'com.shadow.telescope.http',
      'com.shadow.telescope.gost',
    ];
    const promises: any = [];
    oldServices.forEach(service => {
      promises.push(executeCommand('launchctl', [
        'remove',
        service,
      ]));
    });
    await Promise.all(promises);
  }

  const exeName = await fetchExe();

  // sing-box实现那边留了一个端口专门用来关闭进程的
  try {
    const res = await fetch('http://127.0.0.1:23456/exit', {
      method: 'GET',
    });
    Tracking.info('尝试通过API关闭sing-box', {
      status: res.status,
      data: await res.text(),
    });
    await sleep(500);
    if ((await countProcessByName(exeName)) === 0) {
      Tracking.info('已通过API关闭所有sing-box进程', { exeName });
      return;
    }
  } catch (error) {
    Tracking.info('通过API关闭sing-box失败', {
      error,
    });
  }

  try {
    return await killProcessByName(exeName);
  } finally {
    if (!__DEV__) {
      try {
        await remove(SingBoxConfigFileName, {baseDir: BaseDirectory.AppCache});
      } catch (err) {
        console.warn('关闭时，删除旧配置文件时发生错误', err);
      }
    }

    disableOsProxy();
  }
};

export default vpnStop__forTauri;
