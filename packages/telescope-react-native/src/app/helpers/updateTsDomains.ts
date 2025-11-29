import callTsJsonRpcAPI from './callTsJsonRpcAPI';
import setStorageItem from '../../utils/storage/setStorageItem';

/**
 * 同步远程的新域名到本地
 *
 * @returns {Promise<void>}
 */
async function updateTsDomains() {
  try {
    // GetStarHomeApiDomain
    const res = await callTsJsonRpcAPI('live_com');

    const result = [];
    for (const item of res) {
      if (item.address.startsWith('https://') || item.address.startsWith('http://')) {
        result.push(item.address);
      } else {
        result.push(`https://${item.address}`);
      }
    }
    await setStorageItem('REMOTE_DOMAIN_LIST', result.join('|')); // 这里存储好，下次重启就可能会用到了
  } catch (e: any) {}
}

export default updateTsDomains;
