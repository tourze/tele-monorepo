import UUID from 'pure-uuid';
import getChannelName from '../app/getChannelName';
import getVersionName from '../app/getVersionName';
import getPlatform from '../os/getPlatform';
import getArch from '../os/getArch';
import getDeviceId from '../device/getDeviceId';
import getSystemVersion from '../device/getSystemVersion';
import getStorageItem from '../storage/getStorageItem';
import encryptData from './encryptData';
import sendPostRequest from './sendPostRequest';
import decryptData from './decryptData';
import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';
import handleResult from '../handleResult';
import getVersionCode from '../app/getVersionCode';
import { Platform } from 'react-native';

async function sendJsonRPC(
  apiDomain: string,
  appId: string,
  appSecret: string,
  method: string,
  params = {},
  headers = {},
) {
  // console.log('appId', appId);
  // console.log('appSecret', appSecret);
  const id = `${Math.floor(Date.now() / 1000)}-${new UUID(4)}`;

  // 构建请求体
  const newParams = {
    channel: await getChannelName(),
    appVersion: `${await getVersionName()}`,
    platform: await getPlatform(),
    arch: await getArch(),
    deviceId: await getDeviceId(),
    versionCode: `${await getVersionCode()}`,
    systemVersion: Platform.OS === 'web'
      ? `${encodeURIComponent(await getSystemVersion())}`
      : `${await getSystemVersion()}`,
    language: `${await getStorageItem('language')}`,
    ...params,
  };
  const requestBody = JSON.stringify({
    method: method,
    params: newParams,
    id,
    jsonrpc: '2.0', // 遵循jsonrpc协议
  });
  console.log('JsonRPC requestBody', apiDomain, id, method, params);

  // 发起fetch请求
  const init = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Encrypt-AppID': appId,
      ...headers,
    } as any,
    body: encryptData(requestBody, appSecret, appId),
  };

  //process.env.NODE_ENV !== 'production' && console.log('JsonRPC fetchInit', apiDomain, id, method, init);

  let url = `${apiDomain}/json-rpc`;
  if (__DEV__) {
    // 方便我们调试
    url += `?method=${method}&body=${requestBody}`;
  }
  const text = await sendPostRequest(url, init.body, init.headers);
  //process.env.NODE_ENV !== 'production' && console.log('JsonRPC responseText', apiDomain, id, method, text);

  const responseData = decryptData(text, appSecret, appId);
  console.log(
    'JsonRPC responseJson',
    apiDomain,
    responseData.length > 1000
      ? responseData.substring(0, 1000) + '...'
      : responseData,
  );
  const responseJson = isEmpty(responseData) ? null : JSON.parse(responseData);

  // 检查响应数据是否符合jsonrpc 2.0规范
  if (
    !responseJson ||
    responseJson.jsonrpc !== '2.0' ||
    typeof responseJson.id === 'undefined'
  ) {
    throw new Error('响应格式错误');
  }

  // 检查响应是否包含错误信息
  if (responseJson.error) {
    throw new Error(responseJson.error.message || '未知错误');
  }

  const res = responseJson.result;
  if (isObject(res)) {
    handleResult(res);
  }
  return res;
}

export default sendJsonRPC;
