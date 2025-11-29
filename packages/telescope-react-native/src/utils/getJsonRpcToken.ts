import trim from 'lodash/trim';
import getStorageItem from './storage/getStorageItem';

async function getJsonRpcToken() {
  // 补充登录Token
  let token: string | null = null;
  try {
    const value = await getStorageItem('rpc_token');
    if (value !== null) {
      // value previously stored
      token = trim(value);
      token = trim(token, '"');
      token = trim(token, "'");
    }
  } catch (e: any) {
    // error reading value
  }

  return token;
}

export default getJsonRpcToken;
