import { memoize } from 'lodash';
import {getVersion} from '@tauri-apps/api/app';

const getVersionName__forTauri = memoize(async function () {
  return await getVersion();
});

export default getVersionName__forTauri;
