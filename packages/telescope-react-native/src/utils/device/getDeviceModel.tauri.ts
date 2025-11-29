import { platform } from '@tauri-apps/plugin-os';
import { memoize } from 'lodash';
import executeCommand from '../shell/executeCommand';
import Tracking from '../tracking/Tracking';

const getDeviceModel_forMacOS = memoize(async function () {
  const output = await executeCommand('system_profiler', [
    'SPHardwareDataType',
  ]);

  const match = output.match(/Model Identifier:\s*(\S+)/);
  const modelIdentifier = match ? match[1] : '';
  return modelIdentifier.trim();
});

const getDeviceModel_forWindows = memoize(async function () {
  const result = await executeCommand('powershell', [
    '-Command',
    "(Get-WmiObject -Class Win32_ComputerSystem).Model",
  ]);
  return result.trim();
});

const getDeviceModel__forWeb = memoize(async function () {
  const platformName = platform();
  if (platformName === 'windows') {
    try {
      return await getDeviceModel_forWindows();
    } catch (error) {
      Tracking.info('windows::getDeviceModel报错', { error });
    }
  }
  if (platformName === 'macos') {
    try {
      return await getDeviceModel_forMacOS();
    } catch (error) {
      Tracking.info('macos::getDeviceModel报错', { error });
    }
  }
  return '';
});

export default getDeviceModel__forWeb;
