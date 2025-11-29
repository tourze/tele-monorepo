import {getAppId, getAppSecret} from '../../utils/http/callAPI';
import sendJsonRPC from '../../utils/http/sendJsonRPC';
import Tracking from '../../utils/tracking/Tracking';

/**
 * 域名验证器
 *
 * 职责：独立验证域名是否可用，不依赖 getTsApiDomain
 * 解决循环依赖：callTsJsonRpcAPI <-> getTsApiDomain
 */

/**
 * 验证单个域名是否有效
 *
 * @param domain - 要验证的域名
 * @param loginToken - 可选的登录令牌
 * @returns 如果域名有效返回 domain，否则返回空字符串
 */
export async function validateDomain(
  domain: string,
  loginToken: string | null = null
): Promise<string> {
  try {
    const appId = getAppId();
    const appSecret = getAppSecret();

    // 直接调用 sendJsonRPC，不经过 callTsJsonRpcAPI（避免循环）
    const responseJson = await sendJsonRPC(domain, appId, appSecret, 'tencent', {
      loginToken,
    });

    if (responseJson.time) {
      Tracking.info('检测TS域名有效性成功', {
        item: domain,
        time: responseJson.time,
      });
      return domain;
    }
  } catch (error) {
    Tracking.info('检测域名有效性时发生错误', {
      item: domain,
      error,
    });
  }

  return '';
}

/**
 * 验证上次使用的域名是否依然有效
 *
 * @param lastDomain - 上次使用的域名
 * @param loginToken - 可选的登录令牌
 * @returns 是否有效
 */
export async function validateLastDomain(
  lastDomain: string,
  loginToken: string | null = null
): Promise<boolean> {
  if (!lastDomain || lastDomain === 'null' || lastDomain === 'false') {
    return false;
  }

  Tracking.info('正在检测上一次域名是否有效', {item: lastDomain});

  try {
    const appId = getAppId();
    const appSecret = getAppSecret();

    const responseJson = await sendJsonRPC(
      lastDomain,
      appId,
      appSecret,
      'tencent',
      {loginToken}
    );

    if (responseJson.time) {
      Tracking.info('上一次使用的域名依然有效', {item: lastDomain});
      return true;
    }
  } catch (e) {
    Tracking.info('检测上一次域名有效性时发生错误', {
      item: lastDomain,
      error: e,
    });
  }

  return false;
}
