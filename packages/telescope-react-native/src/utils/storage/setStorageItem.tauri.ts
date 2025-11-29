import getCacheKey from './getCacheKey';
import getTauriStore from './getTauriStore';

async function setStorageItem_forWeb(key: string, value: any) {
  const store = await getTauriStore();
  await store.set(await getCacheKey(key), value);
}

export default setStorageItem_forWeb;
