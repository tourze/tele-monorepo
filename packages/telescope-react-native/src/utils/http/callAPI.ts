import getApiDomain from '../network/getApiDomain';
import getJsonRpcToken from '../getJsonRpcToken';
import sendJsonRPC from './sendJsonRPC';

let appId = '';
export function getAppId() {
  return appId;
}
export function setAppId(id: string) {
  appId = id;
}

let appSecret = '';
export function getAppSecret() {
  return appSecret;
}
export function setAppSecret(id: string) {
  appSecret = id;
}

async function callAPI(
  method: string,
  params = {},
  apiDomain = '',
  withJwt = true,
) {
  if (apiDomain === '') {
    apiDomain = await getApiDomain();
  }
  const appId = getAppId();
  const appSecret = getAppSecret();

  const headers: any = {};
  if (withJwt) {
    const rpcToken = await getJsonRpcToken();
    if (rpcToken) {
      headers.Authorization = `Bearer ${rpcToken}`;
    }
  }

  return await sendJsonRPC(
    apiDomain,
    appId,
    appSecret,
    method,
    params,
    headers,
  );
}

export default callAPI;
