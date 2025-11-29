import extractHostAndPort from './extractHostAndPort';
import { shuffle } from 'lodash';
import getCloudFlareGoodIps from '../dns/getCloudFlareGoodIps';
import { invoke } from '@tauri-apps/api/core';
import Tracking from '../tracking/Tracking';

let timeoutList: string[] = [];

async function sendCloudFlareDomainRequest(
  url: string,
  body: string,
  headers: any = [],
) {
  const newHeaders: any = [];
  Object.keys(headers).forEach(header => {
    newHeaders.push({
      key: header,
      value: `${headers[header]}`,
    });
  });

  // 参数参考 https://docs.rs/curl/latest/curl/easy/struct.Easy2.html#method.connect_to
  // HOST:PORT:CONNECT-TO-HOST:CONNECT-TO-PORT
  // 这里我们假设所有域名都是CF的了
  const parts = extractHostAndPort(url);
  if (parts === null) {
    throw new Error(`请求失败: URL解析失败`);
  }

  let cfDomains = shuffle(await getCloudFlareGoodIps()).filter((cfDomain: string) => {
    // 要过滤所有标记为超时的域名
    return !timeoutList.includes(cfDomain);
  });
  // 如果一个都没，说明全部都失效，我们重新来
  if (cfDomains.length === 0) {
    cfDomains = shuffle(await getCloudFlareGoodIps());
    timeoutList = [];
  }

  while (cfDomains.length > 0) {
    const cfDomain = cfDomains.shift();
    if (!cfDomain) {
      break;
    }

    try {
      const response: any = await invoke('plugin:ttmanager|curl_fetch', {
        options: {
          url,
          method: 'POST',
          timeout: 10,
          headers: newHeaders,
          body,
          connect_to: [
            `${parts.host}:${parts.port}:${cfDomain}:443`,
          ],
        },
      });
      console.log('tauri curl post res', cfDomain, response);
      if (response.status !== 200) {
        continue;
      }
      return response.body as string;
    } catch (e: any) {
      Tracking.info('CURL发起POST请求失败', {
        cfDomain,
        url,
        body,
        headers,
        error: e,
      });
      if (e.includes('Connection timed out after')) {
        timeoutList.push(cfDomain);
      }
      console.log(timeoutList);
    }
  }
  throw new Error(`请求CF失败: 请检查网络`);
}

export default sendCloudFlareDomainRequest;
