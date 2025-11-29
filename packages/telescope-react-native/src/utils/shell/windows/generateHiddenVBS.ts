import { appCacheDir, BaseDirectory } from '@tauri-apps/api/path';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { crlf, CRLF } from 'crlf-normalize';
import fixPath from '../../vpn/tauri/fixPath';
import { memoize } from 'lodash';

const appCacheDir1 = memoize(appCacheDir);

/**
 * 生成一个可以静默执行bat的vbs
 */
async function generateHiddenVBS(batchNumber: string, batFile: string): Promise<string> {
  const data = `
Set objShell = WScript.CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' 获取脚本所在的目录
strCurrentDirectory = objFSO.GetParentFolderName(WScript.ScriptFullName)

' 构造bat文件的完整路径
strBatFilePath = strCurrentDirectory & "\\\\${batchNumber}.bat"

' 执行bat文件，并隐藏窗口
objShell.Run "%comspec% /c """ & strBatFilePath & """", 0
`;
  const vbsName = `${batchNumber}.vbs`;
  await writeTextFile(vbsName, crlf(data, CRLF), { baseDir: BaseDirectory.AppCache });
  return fixPath(`${await appCacheDir1()}/${vbsName}`);
}

export default generateHiddenVBS;
