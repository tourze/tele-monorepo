import { platform } from '@tauri-apps/plugin-os';
import { memoize, trim } from 'lodash';
import executeCommand from '../shell/executeCommand';
import Tracking from '../tracking/Tracking';

/**
 * 获取设备型号名，例如 xxx 的 iPhone
 */
const getDeviceName_forMacOS = memoize(async function () {
  const result = await executeCommand('scutil', ['--get', 'ComputerName']);
  return trim(result);
});

const getDeviceName_forWindows = memoize(async function () {
  const result = await executeCommand('hostname');
  return result.trim();
});

const getDeviceName__forWeb = memoize(async function () {
  const platformName = platform();
  if (platformName === 'windows') {
    try {
      return await getDeviceName_forWindows();
    } catch (error) {
      Tracking.info('windows::getDeviceName报错', { error });
    }
  }
  if (platformName === 'macos') {
    try {
      return await getDeviceName_forMacOS();
    } catch (error) {
      Tracking.info('macos::getDeviceName报错', { error });
    }
  }
  return '';
});

export default getDeviceName__forWeb;
