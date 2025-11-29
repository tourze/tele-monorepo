import { platform } from '@tauri-apps/plugin-os';
import executeCommand from '../shell/executeCommand';
import trim from 'lodash/trim';

async function getInstalledPackages__fowWindows() {
  return [];
  // const wmicOutput = trim(
  //   await executeCommand('wmic', [
  //     'product',
  //     'get',
  //     // TODO 要拆分为多次执行，但是那样子速度就很慢了
  //     'IdentifyingNumber,InstallDate,Name,Vendor,Version',
  //   ]),
  // );
  //
  // // 首先按行分割
  // const lines = wmicOutput.trim().split('\n');
  //
  // // 移除标题行
  // lines.shift();
  //
  // // 通过映射每一行来创建对象数组
  // return (
  //   lines
  //     .map(line => {
  //       // 正则表达式匹配非空白字符序列或括号内空白字符序列
  //       const match = line.match(
  //         /(\{[^}]+\})\s+(\d+)\s+(.*?)\s{2,}(\w[\w\s]*\w)\s{2,}(\d+\.\d+\.\d+\.\d+)/,
  //       );
  //
  //       // 如果匹配成功，创建对象
  //       if (match) {
  //         return {
  //           packageName: match[1].trim(),
  //           appName: match[3].trim(),
  //           vendor: match[4].trim(),
  //           versionName: match[5].trim(),
  //           installDate: match[2].trim(),
  //         };
  //       } else {
  //         return null; // 或者你可以选择抛出错误或处理不匹配的行
  //       }
  //     })
  //     // 过滤掉任何 null 条目
  //     .filter(product => product !== null)
  // );
}

// Function to convert a single app's information to an object
function appInfoToObject(appInfo: string) {
  const infoLines = appInfo.split('\n').map(line => line.trim());
  const appName = infoLines.shift(); // The first line is the app name
  const appObject: any = {Name: appName}; // Initialize the app object with the name

  infoLines.forEach((line: string) => {
    const [key, value] = line.split(':').map((part: string) => part.trim());
    if (key && value) {
      appObject[key] = value;
    }
  });

  return appObject;
}

async function getInstalledPackages__forMacOS() {
  const rawData = trim(
    await executeCommand('system_profiler', ['SPApplicationsDataType']),
  );

  // Split the raw data by double newlines to separate each app's info
  const appsData = rawData.trim().split('\n\n    ');

  // Map the array of app data strings to an array of app info objects
  return appsData.slice(1).map(appInfo => appInfoToObject(appInfo));
}

const getInstalledPackages__forTauri = async function () {
  const platformName = platform();
  if (platformName === 'windows') {
    return await getInstalledPackages__fowWindows();
  }
  if (platformName === 'macos') {
    return await getInstalledPackages__forMacOS();
  }
  return '';
};

export default getInstalledPackages__forTauri;
