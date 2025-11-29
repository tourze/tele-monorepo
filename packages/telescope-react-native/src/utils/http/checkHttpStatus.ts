import {request as curlRequest} from 'react-native-curl';
import Tracking from '../tracking/Tracking';
import resolveIpOverride from './resolveIpOverride';

async function checkHttpStatus(url: string, statusCode: number): Promise<boolean> {
  try {
    const {ipOverride} = await resolveIpOverride(url);

    const response = await curlRequest({
      url,
      method: 'GET',
      timeoutMs: 1000 * 5,
      followRedirects: true,
      ipOverride,
    });

    const status = response.status ?? 0;

    if (!response.ok && status <= 0) {
      const code = response.error?.code || 'curl_error';
      const message = response.error?.message || '请求失败';
      throw new Error(`${code}: ${message}`);
    }

    if (status <= 0) {
      throw new Error(`curl_error: 未返回有效状态码`);
    }

    return status === statusCode;
  } catch (error) {
    Tracking.info('checkHttpStatus发生异常', {
      url,
      statusCode,
      error,
    });
    return false;
  }
}

export default checkHttpStatus;
