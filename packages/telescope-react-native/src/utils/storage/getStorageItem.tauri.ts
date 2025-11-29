import getCacheKey from './getCacheKey';
import getTauriStore from './getTauriStore';

async function getStorageItem_forWeb(key: string) {
  const store = await getTauriStore();
  return await store.get<{value: string}>(await getCacheKey(key));
}

export default getStorageItem_forWeb;
