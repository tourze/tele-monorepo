import { getName } from '@tauri-apps/api/app';
import { readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { memoize } from 'lodash';

const getName1 = memoize(getName);

async function getTrackLogsTauri() {
  const appName = await getName1();
  return await readTextFile(`${appName}.log`, { baseDir: BaseDirectory.AppLog });
}

export default getTrackLogsTauri;
