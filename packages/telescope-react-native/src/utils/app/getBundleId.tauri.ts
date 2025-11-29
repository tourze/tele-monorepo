import {appDataDir} from '@tauri-apps/api/path';
import { memoize } from 'lodash';
import trim from 'lodash/trim';

/**
 * @see https://github.com/tauri-apps/tauri/discussions/6752 没办法指定读取
 */
const getBundleId__forTauri = memoize(async (): Promise<string> => {
  let appDataDirPath = (await appDataDir()).replaceAll('\\', '/');
  appDataDirPath = trim(appDataDirPath, '/');
  return appDataDirPath.split('/').pop() as string;
});

export default getBundleId__forTauri;
