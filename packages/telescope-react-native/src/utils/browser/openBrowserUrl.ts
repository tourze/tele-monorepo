import {Linking} from 'react-native';
import Tracking from '../tracking/Tracking';

export default async function openBrowserUrl({url}: {url: string}) {
  const supported = await Linking.canOpenURL(url);
  if (!supported) {
    throw new Error('无法打开指定URL：' + url);
  }

  try {
    return await Linking.openURL(url);
  } catch (e: any) {
    Tracking.info('openBrowserUrl失败', {
      url,
      error: e,
      step: 1,
    });
  }

  throw new Error('无法打开');
}
