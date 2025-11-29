import getStorageItem from './storage/getStorageItem';
import openBrowserUrl from './browser/openBrowserUrl';

async function openKefuWindow() {
  const config: any = await getStorageItem('config');
  // 打开TG链接
  if (config?.TelegramKefuLink) {
    await openBrowserUrl(config?.TelegramKefuLink);
  }
}

export default openKefuWindow;
