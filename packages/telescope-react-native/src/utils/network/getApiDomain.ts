import isEmpty from 'lodash/isEmpty';
import { memoize } from 'lodash';
import getStorageItem from '../storage/getStorageItem';
import { getDefaultApiDomains } from './getDefaultApiDomains';
import getStorageKey from './getStorageKey';

/**
 * 优先读取缓存中的域名，否则就返回一个默认域名咯
 */
const getApiDomain = memoize(async function () {
  // 如果有写死，就固定返回一个好了
  try {
    const item = await getStorageItem('FIXED_API_URL');
    if (item != null) {
      const v = JSON.parse(item);
      if (!isEmpty(v)) {
        return v;
      }
    }
  } catch (e) {}

  try {
    const item = await getStorageItem(await getStorageKey());
    if (item) {
      return item;
    }
  } catch (e) {}
  return getDefaultApiDomains()[0];
});

export default getApiDomain;
