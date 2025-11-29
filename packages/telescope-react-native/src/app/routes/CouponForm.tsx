import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import trim from 'lodash/trim';
import {fetcher} from '../hooks/useRequest';
import {API_CARD_ACTIVE, CrispLink, TelegramKefuLink} from '../constants';
import {useTranslation} from 'react-i18next';
import useStorage from '../../hooks/useStorage';
import usePathRedirect from '../helpers/usePathRedirect';
import useSizeTransform from '../../hooks/useSizeTransform';
import debounceClick from '../../utils/debounceClick';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import Tracking from '../../utils/tracking/Tracking';
import toastError from '../../utils/ui/toastError';
import toastSuccess from '../../utils/ui/toastSuccess';
import Loading from '../../utils/ui/Loading';
import PrimaryButton from '../../components/button/PrimaryButton';
import {useSafeState} from 'ahooks';
import TsInput from '../../components/TsInput';

const CouponFormPage = ({navigation}) => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  const [number, setNumber] = useSafeState('');
  const [password, setPassword] = useSafeState('');
  const {data: config} = useStorage('config');

  const pathRedirect = usePathRedirect();

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
          paddingLeft: sizeTransform(30),
          paddingRight: sizeTransform(30),
          paddingBottom: sizeTransform(30),
        }}>
        <TsInput
          placeholder={t('Page_CouponForm_CardNumber')}
          value={number}
          onChangeText={nextValue => setNumber(nextValue)}
        />
      </View>

      <View
        style={{
          paddingLeft: sizeTransform(30),
          paddingRight: sizeTransform(30),
          paddingBottom: sizeTransform(30),
        }}>
        <TsInput
          placeholder={t('Page_CouponForm_CardPassword')}
          value={password}
          onChangeText={nextValue => setPassword(nextValue)}
        />
      </View>

      <View
        style={{
          padding: sizeTransform(30),
        }}>
        <PrimaryButton
          title={t('Page_CouponForm_ActiveButton')}
          onClick={debounceClick(async () => {
            await Loading.show('激活中');
            Tracking.info('激活卡券', {
              card_number: number,
              card_password: password,
            });

            fetcher(
              API_CARD_ACTIVE,
              {
                card_number: trim(number),
                card_password: trim(password),
              },
              true,
            )
              .then(res => {
                toastSuccess(res.message);
              })
              .catch(error => {
                toastError(error.message);
              })
              .finally(() => {
                Loading.hide();
              });
          })}
        />
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: sizeTransform(30),
        }}>
        <TouchableOpacity
          onPress={debounceClick(() => {
            Tracking.info('跳转到卡券列表');
            navigation.push('CouponList');
          })}>
          <Text style={{color: '#666'}}>
            {t('Page_CouponForm_HistoryRecord')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            marginTop: sizeTransform(30),
          }}
          onPress={debounceClick(() => {
            Tracking.info('卡劵-点击在线客服');
            if (config?.cardMoreUrl) {
              // 参考 https://help.crisp.chat/en/article/how-can-i-embed-the-crisp-chatbox-in-an-external-link-or-an-iframe-bkfh98/
              pathRedirect(
                config.cardMoreUrl === TelegramKefuLink
                  ? {
                      path: `webview:${CrispLink}`,
                      title: t('OnlineKefu'),
                    }
                  : config.cardMoreUrl,
              );
            }
          })}>
          <Text style={{color: '#666'}}>{t('Page_CouponForm_Kefu')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
});

export default withErrorBoundary(CouponFormPage, {
  FallbackComponent: CatchError,
});
