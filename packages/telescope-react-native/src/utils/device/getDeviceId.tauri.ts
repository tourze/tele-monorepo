import { platform } from '@tauri-apps/plugin-os';
import { memoize } from 'lodash';
import executeCommand from '../shell/executeCommand';
import md5 from 'md5';
import trim from 'lodash/trim';
import Tracking from '../tracking/Tracking';

const getDeviceId__forWindows = memoize(async (): Promise<string> => {
  // 为了兼容旧版本，我们这里的算法要跟以前保持一致

  const systemId = (await executeCommand('powershell', [
      '-Command',
      "(Get-WmiObject -Class Win32_ComputerSystemProduct).UUID",
    ]))
    .trim();

  // wmic path win32_diskdrive where deviceid='\\\\.\\PHYSICALDRIVE0' get serialnumber
  let hdID = 'unknowhid';
  try {
    hdID = (await executeCommand('powershell', [
        '-Command',
        '(Get-WmiObject -Class Win32_PhysicalMedia).SerialNumber',
      ]))
      .trim();
  } catch (error) {
    Tracking.info('获取硬盘ID失败', {
      error,
    });
  }

  // 旧版本的CPU读取逻辑有bug，总是返回了 unknowcpu
  const cpuId = 'unknowcpu';
  // const cpuId = (await executeCommand('wmic', ['cpu', 'get', 'processorid']))
  //   .trim()
  //   .replaceAll('\r\r\n\n', '\n')
  //   .split('\n')[1]
  //   .trim();

  Tracking.info('获得设备上下文信息', {
    systemId,
    hdID,
    cpuId,
  });

  return md5(`${systemId}${hdID}${cpuId}`);
});

const getDeviceId_forMacOS = memoize(async function () {
  let result = await executeCommand('ioreg', [
    '-rd1',
    '-c',
    'IOPlatformExpertDevice',
  ]);
  result = result
    .split('IOPlatformUUID')[1]
    .split('\n')[0]
    .replace(/\=|\s+|\"/gi, '')
    .toLowerCase();

  return trim(result);
});

const getDeviceId__forTauri = memoize(async (): Promise<string> => {
  const platformName = platform();
  if (platformName === 'windows') {
    try {
      return await getDeviceId__forWindows();
    } catch (error) {
      Tracking.info('windows::getDeviceId报错', { error });
    }
  }
  if (platformName === 'macos') {
    try {
      return await getDeviceId_forMacOS();
    } catch (error) {
      Tracking.info('macos::getDeviceId报错', { error });
    }
  }
  return '';
});

export default getDeviceId__forTauri;
