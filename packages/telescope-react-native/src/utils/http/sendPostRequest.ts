import {request as curlRequest} from 'react-native-curl';
import resolveIpOverride from './resolveIpOverride';

async function sendPostRequest(
  url: string,
  body: any,
  headers: any = {},
): Promise<string> {
  try {
    const {ipOverride} = await resolveIpOverride(url);

    const response = await curlRequest({
      url,
      method: 'POST',
      headers,
      body: typeof body === 'string' ? body : JSON.stringify(body),
      timeoutMs: 1000 * 10, // 10s 超时
      followRedirects: true,
      ipOverride,
    });

    if (!response.ok) {
      const snippet = response.bodyText ? response.bodyText.slice(0, 200) : '';
      const status = response.status ?? 0;
      const errorMessage = response.error?.message;
      throw new Error(`[POST] ${url} 请求失败: ${status}${errorMessage ? `, ${errorMessage}` : ''}${snippet ? `, ${snippet}` : ''}`);
    }

    const status = response.status ?? 0;
    if (status <= 0) {
      throw new Error(`[POST] ${url} 请求失败: curl_error${response.error?.message ? `, ${response.error.message}` : ''}`);
    }

    if (status < 200 || status >= 300) {
      const snippet = response.bodyText ? response.bodyText.slice(0, 200) : '';
      throw new Error(`[POST] ${url} 请求失败: ${status}${snippet ? `, ${snippet}` : ''}`);
    }

    return response.bodyText ?? '';
  } catch (err: any) {
    const name = err?.name || 'Error';
    const message = err?.message || String(err);
    const lower = `${name} ${message}`.toLowerCase();
    const isTimeout = lower.includes('timeout') || lower.includes('timed out') || name === 'AbortError';
    // 将网络/超时错误携带 URL 抛出，便于上层记录
    throw new Error(`[POST] ${url} ${isTimeout ? '请求超时' : '请求异常'}: ${name} - ${message}`);
  }
}

export default sendPostRequest;
