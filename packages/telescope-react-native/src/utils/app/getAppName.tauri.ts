import { memoize } from 'lodash';
import {getName} from '@tauri-apps/api/app';

const getAppName__forTauri = memoize(async () => {
  return await getName();
});

export default getAppName__forTauri;
