import {memoize} from 'lodash';
import isEmpty from 'lodash/isEmpty';
import shuffle from 'lodash/shuffle';
import uniq from 'lodash/uniq';

import {apiDomains} from '../../config';
import fetchBackupDomains from '../../utils/network/fetchBackupDomains';
import getStorageItem from '../../utils/storage/getStorageItem';
import setStorageItem from '../../utils/storage/setStorageItem';
import Tracking from '../../utils/tracking/Tracking';

import {validateDomain, validateLastDomain} from './domainValidator';

const storageKey = 'telescope_API_DOMAIN';

/**
 * 优先读取缓存中的域名，否则就返回一个默认域名咯
 */
const getTsApiDomain = memoize(async function (): Promise<string> {
  // 如果有写死，就固定返回一个好了
  try {
    const item = await getStorageItem('FIXED_API_URL');
    if (item != null) {
      const v = JSON.parse(item);
      if (!isEmpty(v)) {
        return v;
      }
    }
  } catch (e) {
    // 读取失败，继续尝试其他方式
  }

  try {
    const item = await getStorageItem(storageKey);
    if (item) {
      return item;
    }
  } catch (e) {
    // 读取失败，使用默认域名
  }
  return apiDomains[0];
});

/**
 * 检查上一次的域名是否还能继续使用
 */
async function checkLastDomain(): Promise<boolean> {
  // 如果当前存储中使用到的域名还有效，我们就不重复查找了
  const item = await getStorageItem(storageKey);
  if (!item || item === 'null' || item === 'false') {
    return false;
  }

  // 使用独立的验证器，避免循环依赖
  return await validateLastDomain(item);
}

async function checkItem(item: string): Promise<string> {
  // 使用独立的验证器，避免循环依赖
  return await validateDomain(item);
}

function checkItems(checkList: string[]): Promise<string>[] {
  const promises: Promise<string>[] = [];
  for (const item of shuffle(checkList)) {
    if (!item) {
      continue;
    }
    if (isEmpty(item)) {
      continue;
    }
    if (item === 'null') {
      continue;
    }
    if (item === 'undefined') {
      continue;
    }

    promises.push(checkItem(item));
  }
  return promises;
}

/**
 * 遍历找出一个有效的域名
 */
async function checkLocalDomains(): Promise<boolean> {
  // 域名不要全部都用本地的，也需要检查下远程有没有下发
  let remoteList = '';
  try {
    remoteList = `${await getStorageItem('REMOTE_DOMAIN_LIST')}`;
  } catch (e) {
    remoteList = '';
  }

  const checkList = uniq([...remoteList.split('|'), ...apiDomains]);

  const okDomains = (await Promise.all(checkItems(checkList))).filter(domain => domain.trim() !== '');
  Tracking.info('获得有效TS域名列表', {
    domains: okDomains,
  });
  // 不再进行任何 DoH 相关探测，完全依赖系统 DNS
  for (const item of okDomains) {
    if (!item) {
      continue;
    }
    if (isEmpty(item)) {
      continue;
    }

    // 只保存第一个
    await setStorageItem(storageKey, item);
    return true;
  }

  // 如果都查询不到，那我们就要尝试从其他地址读取咯
  const domains = await fetchBackupDomains([
    'https://club.rt-thread.org/u/024256d3233a3e26',
  ]);
  const okDomains2 = (await Promise.all(checkItems(domains))).filter(domain => domain.trim() !== '');
  Tracking.info('获得备用域名列表', {
    okDomains2: okDomains2,
  });
  for (const item of okDomains2) {
    if (!item) {
      continue;
    }
    if (isEmpty(item)) {
      continue;
    }

    // 只保存第一个
    await setStorageItem(storageKey, item);
    return true;
  }

  return false;
}

async function check(): Promise<boolean> {
  if (await checkLastDomain()) {
    return true;
  }
  return await checkLocalDomains();
}

export default getTsApiDomain;
export {check, checkLastDomain, checkLocalDomains};
