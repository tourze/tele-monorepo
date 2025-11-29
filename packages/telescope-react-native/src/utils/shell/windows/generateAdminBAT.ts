import { BaseDirectory, appCacheDir } from '@tauri-apps/api/path';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { crlf, CRLF } from 'crlf-normalize';
import fixPath from '../../vpn/tauri/fixPath';
import { memoize } from 'lodash';

const appCacheDir1 = memoize(appCacheDir);

async function generateAdminBAT(batchNumber: string, command: string) {
  const data = `
@echo OFF
@cls

:: 开始获取管理员权限
setlocal
set uac=~uac_permission_tmp_%random%
md "%SystemRoot%\\system32\\%uac%" 2>nul
if %errorlevel%==0 ( rd "%SystemRoot%\\system32\\%uac%" >nul 2>nul ) else (
    echo set uac = CreateObject^("Shell.Application"^)>"%temp%\\%uac%.vbs"
    echo uac.ShellExecute "%~s0","","","runas",0 >>"%temp%\\%uac%.vbs"
    echo WScript.Quit >>"%temp%\\%uac%.vbs"
    "%temp%\\%uac%.vbs" /f
    del /f /q "%temp%\\%uac%.vbs" & exit )
endlocal
:: 完成获取

@echo OFF
@cls

${command}

exit
`;

  const batName = `${batchNumber}.bat`;
  await writeTextFile(batName, crlf(data, CRLF), { baseDir: BaseDirectory.AppCache });
  return fixPath(`${await appCacheDir1()}/${batName}`);
}

export default generateAdminBAT;
