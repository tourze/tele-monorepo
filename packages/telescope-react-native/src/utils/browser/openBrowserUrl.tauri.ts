import { open } from '@tauri-apps/plugin-shell';

async function openBrowserUrl__web({url}: {url: string}) {
  await open(url);
}

export default openBrowserUrl__web;
