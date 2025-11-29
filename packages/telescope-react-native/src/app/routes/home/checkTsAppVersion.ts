import {Alert} from 'react-native';
import {getI18n} from 'react-i18next';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Tracking from '../../../utils/tracking/Tracking';
import openBrowserUrl from '../../../utils/browser/openBrowserUrl';
import callTsJsonRpcAPI from '../../helpers/callTsJsonRpcAPI';
import installApk from '../../../utils/file/installApk';
import confirm from '../../../utils/ui/confirm';

/**
 * 检查并更新代码
 */
async function checkTsAppVersion() {
  // 检查新版本
  let res;
  try {
    // CheckStarHomeNewVersion
    res = await callTsJsonRpcAPI('v7_90');
  } catch (e) {
    return;
  }

  // {
  //  appUrl: "https://api.quickg.vip/upload/Telescope_GW_v2.1.9-1673584947.dmg"
  //  channel: "GW"
  //  content: "修复自动连接精品线路gost没启动"
  //  latestVersion: "2.1.9"
  //  md5: "c57058d8af89db2f5e0247b725414eca"
  //  platform: "MAC"
  //  title: "mac_2.1.9"
  // }

  // 下载APK开始安装咯
  const download = ReactNativeBlobUtil.config({fileCache: true}).fetch(
    'GET',
    res.appUrl,
  );

  const {t} = getI18n();

  Alert.alert(t('UpgradeModal_Title'), t('UpgradeModal_Desc'), [
    {
      text: t('UpgradeModal_Buttons_UseOld'),
      onPress: () => {
        console.log('Cancel Pressed');
        Tracking.info('新版本升级-使用旧版本', {
          title: res.title,
          appUrl: res.appUrl,
          latestVersion: res.latestVersion,
        });
      },
      style: 'cancel',
    },
    {
      text: t('UpgradeModal_Buttons_UseNew'),
      onPress: () => {
        download
          .then(async result => {
            Tracking.info('新版本升级-我要升级-下载成功', {
              title: res.title,
              appUrl: res.appUrl,
              latestVersion: res.latestVersion,
              statusCode: result.respInfo.status,
            });
            let installResult = false;
            if (result.respInfo.status === 200) {
              try {
                await installApk(result.path());
                installResult = true;
              } catch (e) {
                Tracking.info('新版本升级-我要升级-安装APK失败', {
                  title: res.title,
                  appUrl: res.appUrl,
                  latestVersion: res.latestVersion,
                  statusCode: result.respInfo.status,
                  exception: `${e}`,
                });
              }
            }

            console.log('installResult', installResult);
            if (!installResult) {
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
                  statusCode: result.respInfo.status,
                });
                openBrowserUrl({
                  url: 'https://telescopes.vip/',
                });
              } catch (e) {
                Tracking.info('新版本升级-我要升级-暂时不', {
                  title: res.title,
                  appUrl: res.appUrl,
                  latestVersion: res.latestVersion,
                  statusCode: result.respInfo.status,
                });
              }
            }
          })
          .catch(err => {
            Tracking.info('新版本升级-我要升级-下载失败', {
              title: res.title,
              appUrl: res.appUrl,
              latestVersion: res.latestVersion,
              error: `${err}`,
            });
          });
      },
      //style: 'confirm',
    },
  ]);
}

export default checkTsAppVersion;
