import getStorageItem from '../storage/getStorageItem';
import uniq from 'lodash/uniq';
import shuffle from 'lodash/shuffle';
import isEmpty from 'lodash/isEmpty';
import callAPI from '../http/callAPI';
import Tracking from '../tracking/Tracking';
import setStorageItem from '../storage/setStorageItem';
import { getDefaultApiDomains } from './getDefaultApiDomains';
import getStorageKey from './getStorageKey';
import removeStorageItem from '../storage/removeStorageItem';

async function checkItem(item: string): Promise<string> {
  try {
    const responseJson = await callAPI('GetServerTime', {}, item, false);
    if (responseJson.time) {
      return item;
    }
  } catch (error) {
    // 异常的话，不处理
    Tracking.info('检测域名有效性时发生错误', {
      item,
      error,
    });
  }
  return '';
}

/**
 * 遍历找出一个有效的域名
 */
async function checkLocalDomains() {
  // 如果有上次优先轮询到的域名，那我们在这里优先处理
  let preferDomains = await getStorageItem('PREFER_API_DOMAINS');
  if (preferDomains === null || preferDomains === undefined) {
    // @ts-ignore
    preferDomains = [];
  } else {
    console.log('preferDomains', preferDomains);
    preferDomains = JSON.parse(preferDomains);
  }
  if (preferDomains && preferDomains.length > 0) {
    for (const item of preferDomains) {
      if (await checkItem(item)) {
        await setStorageItem(await getStorageKey(), item);
        return;
      }
    }
  }

  // 域名不要全部都用本地的，也需要检查下远程有没有下发
  let remoteList = '';
  try {
    remoteList = `${await getStorageItem('REMOTE_DOMAIN_LIST')}`;
  } catch (e) {
    remoteList = '';
  }

  let checkList = [...getDefaultApiDomains()];
  if (!isEmpty(remoteList)) {
    checkList = uniq([...remoteList.split('|'), ...checkList]);
  }
  console.log('checkList', checkList);

  const promises: Promise<string>[] = [];
  shuffle(checkList).map(item => {
    if (!item) {
      return;
    }
    if (isEmpty(item)) {
      return;
    }
    if (item === 'null') {
      return;
    }

    promises.push(checkItem(item));
  });

  const okDomains = await Promise.all(promises);
  Tracking.info('获得有效域名列表', {
    domains: okDomains,
  });

  const validDomains: string[] = [];
  for (const item of okDomains) {
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
    validDomains.push(item);
  }

  if (validDomains.length > 0) {
    // 只保存第一个
    await setStorageItem(await getStorageKey(), validDomains[0]);
    if (validDomains.length > 1) {
      // 对于已经检测过并且可用的域名，我们也保存一份，我们下次优先轮询
      validDomains.shift(); // 上面用过的，我们跳过啦
      setStorageItem('PREFER_API_DOMAINS', JSON.stringify(validDomains));
    } else {
      removeStorageItem('PREFER_API_DOMAINS');
    }
    return true;
  }

  Tracking.info('找不到任何有效域名');
  return false;
}

export default checkLocalDomains;
