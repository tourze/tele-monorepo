import Tracking from '../tracking/Tracking';
import shuffle from 'lodash/shuffle';
import chunk from 'lodash/chunk';
import checkHttpStatus from '../http/checkHttpStatus';

const statusUrls = [
  // 百度
  'https://home.baidu.com/Public/img/favicon.ico',
  'https://www.baidu.com/favicon.ico',
  'https://baikebcs.bdimg.com/baike-react/common/favicon-baidu.ico',
  'https://b2b.baidu.com/favicon.ico',
  'https://index.baidu.com/favicon.ico',

  // QQ
  'https://e.qq.com/favicon.ico',
  'https://x5.qq.com/favicon.ico',
  'https://mapapi.qq.com/web/lbs/logo/favicon.ico',
  'https://lol.qq.com/favicon.ico',
  'https://www.qq.com/favicon.ico',
  'https://map.qq.com/favicon.ico',
  'https://connect.qq.com/favicon.ico',
  'https://game.qq.com/favicon.ico',
  'https://sj.qq.com/favicon.ico',
  'https://im.qq.com/favicon.ico',

  // 网易
  'https://gamepay.163.com/gamepay-logo.png',
  'https://dun.163.com/public/res/favicon.ico',
  'https://money.163.com/favicon.ico',
  'https://news.163.com/favicon.ico',
  'https://help.mail.163.com/favicon.ico',

  // 银行相关的
  'https://www.icbc.com.cn/favicon.ico',
  'https://www.ccb.com/favicon.ico',
  'https://www.boc.cn/favicon.ico',
  'https://www.bankcomm.com/favicon.ico',
  'https://www.abchina.com/favicon.ico',
  'https://www.cmbchina.com/favicon.ico',
  'https://www.cmbc.com.cn/favicon.ico',
  'https://www.spdb.com.cn/favicon.ico',
];

/**
 * 首先，我们需要确保我们的网络是OK的
 */
async function checkNetworkStatus() {
  // 4个域名一组
  const urlGroups = chunk(shuffle(statusUrls), 4);
  Tracking.info('状态检查URL进行分组', {
    urlGroups,
  });

  for (const urls of urlGroups) {
    const promises = [];
    for (const item of urls) {
      promises.push(checkHttpStatus(item, 200));
    }
    // 并行发起请求
    const result = await Promise.all(promises);
    Tracking.info('通过URL批量检测网络状态', {
      urls,
      result,
    });
    for (const item of result) {
      if (item) {
        return true;
      }
    }
  }
  return false;
}

export default checkNetworkStatus;
