import getTauriStore from './getTauriStore';

async function getAllStorageKeys__Web() {
  const store = await getTauriStore();
  return await store.keys();
}

export default getAllStorageKeys__Web;
