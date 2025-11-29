import openBrowserUrl from './browser/openBrowserUrl';
import exitApp from './app/exitApp';

function handleResult(obj: any) {
  // 打开H5地址
  if (obj.__openURL) {
    openBrowserUrl({url: obj.__openURL});
  }

  // 退出APP
  if (obj.__exitApp) {
    exitApp();
  }
}

export default handleResult;
