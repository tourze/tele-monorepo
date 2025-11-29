import getCacheKey from './getCacheKey';
import getTauriStore from './getTauriStore';

async function removeStorageItem_forWeb(key: string) {
  const store = await getTauriStore();
  await store.delete(await getCacheKey(key));
}

export default removeStorageItem_forWeb;
