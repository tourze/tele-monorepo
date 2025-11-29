import { platform, version } from '@tauri-apps/plugin-os';
import { memoize } from 'lodash';
import executeCommand from '../shell/executeCommand';
import Tracking from '../tracking/Tracking';

async function getCaption() {
  const result = (await executeCommand('powershell', ['-Command', '(Get-CimInstance -ClassName Win32_OperatingSystem).Caption'])).trim();
  return result.trim();
}

const getSystemVersion_forWindows = memoize(async function () {
  return `${await getCaption()} ${version()}`;
});

const getSystemVersion_forMacOS = memoize(async function () {
  return (await executeCommand('sw_vers', ['-productVersion'])).trim();
});

const getSystemVersion__forTauri = memoize(async function () {
  const platformName = platform();
  if (platformName === 'windows') {
    try {
      return await getSystemVersion_forWindows();
    } catch (error) {
      Tracking.info('windows::getSystemVersion报错', { error });
    }
  }
  if (platformName === 'macos') {
    try {
      return await getSystemVersion_forMacOS();
    } catch (error) {
      Tracking.info('macos::getSystemVersion报错', { error });
    }
  }
  return '';
});

export default getSystemVersion__forTauri;
