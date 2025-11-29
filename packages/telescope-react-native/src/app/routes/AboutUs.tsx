import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import useStorage from '../../hooks/useStorage';
import getVersionName from '../../utils/app/getVersionName';
import useSizeTransform from '../../hooks/useSizeTransform';
import getPlatform from '../../utils/os/getPlatform';
import {withErrorBoundary} from 'react-error-boundary';
import {useTranslation} from 'react-i18next';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';
import Loading from '../../utils/ui/Loading';
import {checkLastDomain, checkLocalDomains} from '../helpers/getTsApiDomain';
import Tracking from '../../utils/tracking/Tracking';
import CatchError from '../../components/CatchError';
import toastSuccess from '../../utils/ui/toastSuccess';
import toastError from '../../utils/ui/toastError';
import openBrowserUrl from '../../utils/browser/openBrowserUrl';
import generateSystemReport from '../../utils/generateSystemReport';
import getChannelName from '../../utils/app/getChannelName';
import PrimaryButton from '../../components/button/PrimaryButton';
import SecondaryButton from '../../components/button/SecondaryButton';
import alertMessage from '../../utils/ui/alertMessage';
import { useDebounceFn, useRequest } from 'ahooks';
import getTracLogs from '../../utils/tracking/getTracLogs';
import exportAppLogs from '../../utils/app/exportAppLogs';

function AboutUsPage() {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  const {data: versionName} = useRequest(getVersionName);
  const {data: channelName} = useRequest(getChannelName);
  const {data: platform} = useRequest(getPlatform);

  const {data: config} = useStorage('config');

  const clickHelpUrl = useDebounceFn(async () => {
    Tracking.info('关于我们-点击帮助链接');

    const url = config?.helpUrl;
    if (!url) {
      return;
    }

    try {
      await openBrowserUrl({url});
      Tracking.info('关于我们-帮助链接打开成功');
    } catch (e) {
      Tracking.info('关于我们-帮助链接打开失败', {
        error: `${e}`,
      });
      alertMessage(`${t('Cannot_Open_Link')} ${url}`);
    }
  }, { leading: true, trailing: false });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: sizeTransform(32),
          paddingBottom: sizeTransform(20),
        }}>
        <Image
          source={require('../images/logo_Telescope512.png')}
          fadeDuration={0}
          style={{
            width: sizeTransform(200),
            height: sizeTransform(200),
          }}
        />
      </View>

      <View
        style={{
          paddingLeft: sizeTransform(80),
          paddingRight: sizeTransform(80),
          paddingBottom: sizeTransform(10),
        }}>
        <Text
          style={{
            textAlign: 'center',
          }}>
          {config?.about}
        </Text>
      </View>

      <View
        style={{
          paddingBottom: sizeTransform(10),
        }}>
        <Text
          style={{
            textAlign: 'center',
          }}>
          {t('VersionName')}: {platform}-{versionName}-{channelName}
        </Text>
      </View>
      <TouchableOpacity
        style={{
          paddingBottom: sizeTransform(10),
        }}
        onPress={clickHelpUrl.run}>
        <Text
          style={{
            textAlign: 'center',
          }}>
          {config?.helpUrl}
        </Text>
      </TouchableOpacity>
      <View
        style={{
          paddingLeft: 10,
          paddingRight: 10,
          paddingBottom: 2,
        }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#339af0',
          }}>
          {config?.homeUrl}
        </Text>
      </View>

      <View style={{flex: 1}} />

      <View style={{padding: sizeTransform(20)}}>
        <PrimaryButton
          title="重新检查API环境"
          size='medium'
          onClick={async () => {
            // 有些人的网络环境经常异常，需要在这里手动重新更新一次API，换一个有效域名
            await Loading.show('API环境重置中，请稍等片刻');

            let domainOk = false;
            try {
              if (!domainOk) {
                if (await checkLastDomain()) {
                  domainOk = true;
                }
              }
              if (!domainOk) {
                if (await checkLocalDomains()) {
                  domainOk = true;
                }
              }
            } catch (e) {
              Tracking.info('重新检查API环境失败', {
                error: `${e}`,
              });
              domainOk = false;
            }

            await Loading.hide();
            if (!domainOk) {
              toastError('重置失败，请从官网重新下载');
              return;
            }
            toastSuccess('重置成功');
          }}
        />
      </View>

      <View style={{padding: sizeTransform(20)}}>
        <SecondaryButton
          size='medium'
          onClick={async () => {
            if (platform === 'windows' || platform === 'mac') {
              await Loading.show('日志导出中，请稍等');
              await exportAppLogs();
              alertMessage('导出成功，请把桌面的“加速日志”文件发给客服');
            } else {
              await Loading.show('报告生成中，请稍等片刻');

              let now;
              try {
                now = await generateSystemReport();
              } catch (error) {
                Tracking.info('上报异常日志生成系统报告失败', {
                  error,
                });
                now = error.message;
              }

              let tracking = '';
              try {
                tracking = await getTracLogs();
              } catch (e) {
                tracking = `${e}`;
              }

              try {
                // UploadStarHomeSystemReport
                await callTsJsonRpcAPI('c8213', {
                  now,
                  tracking,
                });
              } catch (e) {
                Tracking.info('上报异常日志失败', {
                  error: `${e}`,
                });
              }

              toastSuccess(t('Page_AboutUs_UploadReportSuccess'));
            }

            await Loading.hide();
          }}
          title={platform === 'windows' || platform === 'mac' ? '导出日志文件' : '上报异常日志'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
});

export default withErrorBoundary(AboutUsPage, {
  FallbackComponent: CatchError,
});
