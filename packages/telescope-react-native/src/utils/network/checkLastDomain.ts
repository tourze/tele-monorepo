import Tracking from '../tracking/Tracking';
import getStorageItem from '../storage/getStorageItem';
import callAPI from '../http/callAPI';
import getStorageKey from './getStorageKey';

/**
 * 检查上一次的域名是否还能继续使用
 */
async function checkLastDomain() {
  // 如果当前存储中使用到的域名还有效，我们就不重复查找了
  const item = await getStorageItem(await getStorageKey());
  if (item && item !== 'null' && item !== null && item !== 'false') {
    Tracking.info('正在检测上一次域名是否有效', {item});

    try {
      const responseJson = await callAPI('GetServerTime', {}, item, false);
      if (responseJson.time) {
        Tracking.info('上一次使用的域名依然有效', {item});
        return true;
      }
    } catch (error: any) {
      // 异常的话，不处理
      Tracking.info('检测上一次域名有效性时发生错误', {
        item,
        error,
      });
    }
  }

  return false;
}

export default checkLastDomain;
