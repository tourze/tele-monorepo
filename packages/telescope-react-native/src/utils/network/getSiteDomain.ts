import getStorageItem from '../storage/getStorageItem';
import getStorageKey from './getStorageKey';

let siteDomain = '';

/**
 * 优先读取缓存中的域名，否则就返回一个默认域名咯
 */
const getSiteDomain = async function () {
  if (siteDomain !== '') {
    return siteDomain;
  }

  try {
    const item = await getStorageItem(await getStorageKey());
    if (item) {
      return item;
    }
  } catch (e) {}
  return 'https://www.baidu.com';
};

function setSiteDomain(url: string): void {
  siteDomain = url;
}

export { getSiteDomain, setSiteDomain };
