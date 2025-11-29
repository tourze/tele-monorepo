import {request as curlRequest} from 'react-native-curl';
import resolveIpOverride from './resolveIpOverride';

async function sendGetRequest(
  url: string,
  headers: Record<string, string> = {},
): Promise<string | null> {
  // 为兼容部分站点的 WAF（如 Safeline 返回 468），默认补充常见 UA/Accept
  const finalHeaders: Record<string, string> = {
    'User-Agent': headers['User-Agent'] || 'Mozilla/5.0 (Linux; Android 14; rv:122.0) Gecko/20100101 Firefox/122.0',
    'Accept': headers['Accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    ...headers,
  };
  try {
    const {ipOverride} = await resolveIpOverride(url);

    const response = await curlRequest({
      url,
      method: 'GET',
      headers: finalHeaders,
      timeoutMs: 1000 * 10, // 10s 超时
      followRedirects: true,
      ipOverride,
    });

    if (!response.ok) {
      const code = response.error?.code || 'curl_error';
      const message = response.error?.message || `HTTP ${response.status ?? 0}`;
      throw new Error(`${code}: ${message}`);
    }

    const status = response.status ?? 0;
    if (status <= 0) {
      throw new Error(`[GET] ${url} 请求失败: curl_error${response.error?.message ? `, ${response.error.message}` : ''}`);
    }

    if (status !== 200) {
      const snippet = response.bodyText ? response.bodyText.slice(0, 200) : '';
      console.log(
        'sendGetRequest get error status code',
        url,
        headers,
        status,
        snippet,
      );
      return null;
    }
    const res = response.bodyText ?? '';
    if (res === undefined) {
      // 在 iOS 中，如果返回的不是纯文本数据会报错，这里直接返回空字符串作为兜底
      return '';
    }
    return res;
  } catch (err: any) {
    // 给上层更明确的错误上下文（包含 URL 与错误类型）
    const name = err?.name || 'Error';
    const message = err?.message || String(err);
    const lower = `${name} ${message}`.toLowerCase();
    const isTimeout = lower.includes('timeout') || lower.includes('timed out') || name === 'AbortError';
    const prefix = isTimeout ? '请求超时' : '请求异常';
    throw new Error(`[GET] ${url} ${prefix}: ${name} - ${message}`);
  }
}

export default sendGetRequest;
