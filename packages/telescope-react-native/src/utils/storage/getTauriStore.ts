import { memoize } from 'lodash';
import { load } from '@tauri-apps/plugin-store';

const getTauriStore = memoize(async function() {
  return await load('store.dat');
});

export default getTauriStore;
