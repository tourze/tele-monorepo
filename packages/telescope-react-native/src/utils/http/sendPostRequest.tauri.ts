import {fetch} from '@tauri-apps/plugin-http';
import Tracking from '../tracking/Tracking';
// import sendCloudFlareDomainRequest from './sendCloudFlareDomainRequest';

async function sendPostRequest__forTauri(
  url: string,
  body: string,
  headers: any = [],
): Promise<string> {
  // 优先使用 tauri 默认提供的
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });
    if (response.ok) {
      return await response.text();
    }
    Tracking.info('tauri自带的HTTP请求响应异常', {
      url,
      body,
      headers,
      status: response.status,
    });
  } catch (e) {
    Tracking.info('tauri自带的HTTP请求失败', {
      url,
      body,
      headers,
      error: e,
    });
  }

  throw new Error(`请求API失败: 请检查网络`);
  // 如果是CF的域名，那我们尝试下走CF的查询
  // return await sendCloudFlareDomainRequest(url, body, headers);
}

export default sendPostRequest__forTauri;
