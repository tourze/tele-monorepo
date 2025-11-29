import {getI18n} from 'react-i18next';
import callAPI from './http/callAPI';
import openBrowserUrl from './browser/openBrowserUrl';
import Tracking from './tracking/Tracking';
import confirm from './ui/confirm';
import {getSiteDomain} from '../utils/network/getSiteDomain';
import alertMessage from './ui/alertMessage';

/**
 * 检查并更新代码
 */
async function checkAppVersion_forAndroid() {
  // 检查新版本
  let res: any;
  try {
    res = await callAPI('CheckGaleBoostAppVersion', {}, '', false);
  } catch (e: any) {
    return;
  }

  const {t} = getI18n();

  confirm(
    t('UpgradeModal_Title'),
    t('UpgradeModal_Desc'),
    t('UpgradeModal_Buttons_UseNew'),
    t('UpgradeModal_Buttons_UseOld'),
  ).then(async () => {
    try {
      await openBrowserUrl({
        url: res.appUrl,
      });
      Tracking.info('新版本升级-我要升级-打开浏览器成功', {
        title: res.title,
        appUrl: res.appUrl,
        latestVersion: res.latestVersion,
      });
      alertMessage(
        t('UpgradeModal_OpenBrowser_Desc'),
        t('UpgradeModal_OpenBrowser_Title'),
      );
    } catch (error) {
      Tracking.info('新版本升级-我要升级-打开下载链接失败', {
        title: res.title,
        appUrl: res.appUrl,
        latestVersion: res.latestVersion,
        exception: `${error}`,
      });

      try {
        await confirm(
          t('UpgradeModal_Failed_Title'),
          t('UpgradeModal_Failed_Desc'),
          t('UpgradeModal_Failed_OpenSite'),
          t('UpgradeModal_Failed_NotNow'),
        );

        Tracking.info('新版本升级-我要升级-打开官网', {
          title: res.title,
          appUrl: res.appUrl,
          latestVersion: res.latestVersion,
        });
        await openBrowserUrl({
          url: await getSiteDomain(),
        });
      } catch (err) {
        Tracking.info('新版本升级-我要升级-暂时不', {
          title: res.title,
          appUrl: res.appUrl,
          latestVersion: res.latestVersion,
          exception: `${err}`,
        });
      }
    }
  })
    .catch(() => {
      console.log('Cancel Pressed');
      Tracking.info('新版本升级-使用旧版本', {
        title: res.title,
        appUrl: res.appUrl,
        latestVersion: res.latestVersion,
      });
    });
}

export default checkAppVersion_forAndroid;
