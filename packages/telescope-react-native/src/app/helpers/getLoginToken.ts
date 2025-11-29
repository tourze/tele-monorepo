import trim from 'lodash/trim';
import getStorageItem from '../../utils/storage/getStorageItem';

async function getLoginToken() {
  // 补充登录Token
  let token = null;
  try {
    const value = await getStorageItem('token');
    if (value !== null) {
      // value previously stored
      token = trim(value);
      token = trim(token, '"');
      token = trim(token, "'");
    }
  } catch (e) {
    // error reading value
  }
  if (token !== null) {
    if (token.startsWith('Token ')) {
      token = token.replace('Token ', '');
    }
  }
  return token;
}

export default getLoginToken;
