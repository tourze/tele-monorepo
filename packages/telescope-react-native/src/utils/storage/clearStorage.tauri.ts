import getTauriStore from './getTauriStore';

async function clearStorage__forWeb(): Promise<void> {
  const store = await getTauriStore();
  await store.clear();
}

export default clearStorage__forWeb;
