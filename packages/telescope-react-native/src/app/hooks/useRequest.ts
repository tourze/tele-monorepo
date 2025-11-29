import {Platform} from 'react-native';
import CryptoJS from 'crypto-js';
import {nanoid} from 'nanoid/non-secure';
import isObject from 'lodash/isObject';
import isEmpty from 'lodash/isEmpty';
import {ivParameter, sKey} from '../constants';
import getVersionCode from '../../utils/app/getVersionCode';
import getTsApiDomain from '../helpers/getTsApiDomain';
import getVersionName from '../../utils/app/getVersionName';
import handleResult from '../../utils/handleResult';
import getDeviceId from '../../utils/device/getDeviceId';
import getPlatform from '../../utils/os/getPlatform';
import getLoginToken from '../helpers/getLoginToken';
import getChannelName from '../../utils/app/getChannelName';
import getSystemVersion from '../../utils/device/getSystemVersion';
import getBuildNumber from '../../utils/app/getBuildNumber';
import sendPostRequest from '../../utils/http/sendPostRequest';
import Tracking from '../../utils/tracking/Tracking';

const fetcher = async (path, params = {}, aes = false) => {
  const requestId = nanoid();
  const apiDomain = await getTsApiDomain();

  console.log(`${requestId} fetcher request ${apiDomain}${path}`, params);

  const headers: any = {
    accept: 'application/json',
    channel: await getChannelName(),
    appVersion: `${await getVersionName()}`,
    platform: await getPlatform(), // macos比较特别，需要兼容
    imei: `${await getDeviceId()}`,
    versionCode: `${await getVersionCode()}`,
    systemVersion: Platform.OS === 'web'
      ? `${encodeURIComponent(await getSystemVersion())}`
      : `${await getSystemVersion()}`,
    'Content-Type': 'application/json',
  };
  // ios上，多一个 apBuild 的参数
  if (Platform.OS === 'ios') {
    console.log('await getBuildNumber();', await getBuildNumber());
    headers.appBuild = await getBuildNumber();
  }

  // 补充登录Token
  const token = await getLoginToken();
  if (!isEmpty(token)) {
    headers.Authorization = `Token ${token}`;
  }

  let body = JSON.stringify(params);
  if (aes) {
    const key = CryptoJS.enc.Utf8.parse(sKey);
    const iv = CryptoJS.enc.Utf8.parse(ivParameter);
    body = CryptoJS.AES.encrypt(body, key, {iv}).toString();
  }

  console.log(`${requestId} fetcher body ${apiDomain}${path}`, body, headers);
  const responseText = await sendPostRequest(
    `${apiDomain}${path}`,
    body,
    headers,
  );
  Tracking.info(`${requestId} fetch success ${apiDomain}${path}`,{
    responseText,
  });

  const responseJson = JSON.parse(responseText);

  if (responseJson.code !== 200) {
    throw new Error(responseJson.message);
  }

  if (isObject(responseJson.data)) {
    handleResult(responseJson.data);
  }
  return responseJson;
};

let cache = {};

function clearCache() {
  cache = {};
}

export {fetcher, clearCache};
