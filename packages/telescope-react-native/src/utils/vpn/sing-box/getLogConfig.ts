import { appCacheDir } from '@tauri-apps/api/path';
import getLogFileName from './getLogFileName';
import { memoize } from 'lodash';

const getLogConfig = memoize(async function(level: string, runAsRoot: boolean) {
  return {
    disabled: false,
    timestamp: true,
    level,
    output: `${await appCacheDir()}/${await getLogFileName(runAsRoot)}`,
  };
});

export default getLogConfig;
