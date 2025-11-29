import {getVersion} from '@tauri-apps/api/app';
import { memoize } from 'lodash';

const getVersionCode__forWeb = memoize(async function () {
  const version = (await getVersion()).replaceAll('.', '');
  return parseInt(version, 10);
});

export default getVersionCode__forWeb;
