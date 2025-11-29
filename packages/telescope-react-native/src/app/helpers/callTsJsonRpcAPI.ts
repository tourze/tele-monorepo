import {getAppId, getAppSecret} from '../../utils/http/callAPI';
import sendJsonRPC from '../../utils/http/sendJsonRPC';

import getLoginToken from './getLoginToken';
import getTsApiDomain from './getTsApiDomain';

async function callTsJsonRpcAPI(
  method: string,
  params = {},
  apiDomain: string | null = null,
): Promise<unknown> {
  if (apiDomain === null) {
    apiDomain = (await getTsApiDomain()) as string;
  }
  const appId = getAppId();
  const appSecret = getAppSecret();

  return await sendJsonRPC(apiDomain, appId, appSecret, method, {
    // 旧的登陆token
    loginToken: await getLoginToken(),
    ...params,
  });
}

export default callTsJsonRpcAPI;
