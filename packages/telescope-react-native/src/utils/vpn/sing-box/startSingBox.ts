import { BaseDirectory, remove, writeTextFile } from '@tauri-apps/plugin-fs';
import { platform } from '@tauri-apps/plugin-os';
import { SingBoxConfigFileName } from '../../../config';
import spawn from '../../shell/spawn';
import setStorageItem from '../../storage/setStorageItem';
import getSidecarPath from './getSidecarPath';
import { appCacheDir } from '@tauri-apps/api/path';
import Tracking from '../../tracking/Tracking';
import fixPath from '../tauri/fixPath';
import generateAdminBAT from '../../shell/windows/generateAdminBAT';
import generateHiddenVBS from '../../shell/windows/generateHiddenVBS';
import executeCommand__forTauri from '../../shell/executeCommand.tauri';
import executeCommand from '../../shell/executeCommand';
import getLogFileName from './getLogFileName';

function getRandomIntInRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function startSingBox(json: any, runAsRoot: boolean): Promise<number> {
  try {
    await remove(SingBoxConfigFileName, {baseDir: BaseDirectory.AppCache});
  } catch (error) {
    Tracking.info('删除旧配置文件时发生错误', {
      error,
    });
  }

  // 日志文件，我们也删一次
  try {
    await remove(await getLogFileName(runAsRoot), { baseDir: BaseDirectory.AppCache });
  } catch (error) {
    Tracking.info('删除旧日志文件时发生错误', {
      error,
    });
  }

  // 生成新的配置文件
  await writeTextFile(SingBoxConfigFileName, JSON.stringify(json, null, 2), {
    baseDir: BaseDirectory.AppCache,
  });

  const configFile = fixPath(`${await appCacheDir()}/${SingBoxConfigFileName}`);

  // TODO 先本地测试
  console.log(
    '获得json配置文件：',
    `${configFile}`,
  );
  // return 0;

  try {
    // 有一些场景模式，我们需要使用root来跑，因为需要注册网卡
    if (runAsRoot) {
      let singBoxPath = '';
      try {
        singBoxPath = await getSidecarPath('sing-box');
      } catch (error) {
        Tracking.info('获取singBoxPath失败', {
          error,
        });
      }
      singBoxPath = fixPath(singBoxPath);

      // Macos下getSidecarPath获得的路径有点问题，返回的是 /Applications/Telescope.app/Contents/Resources/sing-box
      // 其实应该是 /Applications/Telescope.app/Contents/MacOS/sing-box
      const p = platform();
      if (p === 'macos' && singBoxPath.includes('Contents/Resources/sing-box')) {
        singBoxPath = singBoxPath.replaceAll('Contents/Resources/sing-box', 'Contents/MacOS/sing-box');
      }

      Tracking.info('singBoxPath', {
        singBoxPath,
      });

      if (singBoxPath.length > 0) {
        let pid = 0;
        if (p === 'macos') {
          await executeCommand(
            'osascript',
            [
              '-e',
              `do shell script "${singBoxPath} run -c ${configFile} > /dev/null 2>&1 &" with administrator privileges`
            ],
          );
          pid = Number.MAX_SAFE_INTEGER;
        } else if (p === 'windows') {
          singBoxPath = fixPath(await getSidecarPath('sing-box.exe'));
          // 开始构造脚本信息，使用vbs+bat，以触发系统的UAC，实现提权执行
          const command = `"${singBoxPath}" run -c "${configFile}"`;
          const batchNumber = `tmp-${getRandomIntInRange(10000, 99999)}`;
          const batFile = await generateAdminBAT(batchNumber, command);
          const vbsFile = await generateHiddenVBS(batchNumber, batFile);
          Tracking.info('win执行sing-box', {
            command,
            batFile,
            vbsFile,
          });
          await executeCommand__forTauri('wscript', [vbsFile]);
          // 实际上这里是可能异步的，我们只是模拟返回一个假的pid
          pid = Number.MAX_SAFE_INTEGER;
        } else {
          // TODO 管理员权限才可以的吧？
          pid = await spawn(
            'sing-box',
            ['run', '-c', `${configFile}`],
            {sidecar: true},
          );
        }

        await setStorageItem('SING_BOX_PID', pid);
        Tracking.info('高权限执行sing-box', {
          pid,
          configFile,
          singBoxPath,
        });
        return pid;
      }
    }

    const pid = await spawn(
      'sing-box',
      ['run', '-c', `${configFile}`],
      {sidecar: true},
    );
    await setStorageItem('SING_BOX_PID', pid);
    Tracking.info('低权限执行sing-box', {
      pid,
      configFile,
    });
    return pid;
  } catch (error) {
    Tracking.info('startSingBox error', {
      error,
    });
  }
  return 0;
}

export default startSingBox;
