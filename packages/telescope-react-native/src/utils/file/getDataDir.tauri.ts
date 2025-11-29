import { appConfigDir } from '@tauri-apps/api/path';
import { memoize } from 'lodash';

const getDataDir__forTauri = memoize(async function() {
  return await appConfigDir();
});

export default getDataDir__forTauri;
