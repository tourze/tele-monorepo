import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {Input, Button} from '../../react-native-ui-kitten/components';
import {clearCache as clearRequestCache, fetcher} from '../hooks/useRequest';
import {
  API_GET_CAPTCHA,
  API_POST_LOGIN,
  API_POST_RESET_PASSWORD,
} from '../constants';
import {set} from '../../hooks/useStorage';
import getDeviceModel from '../../utils/device/getDeviceModel';
import debounceClick from '../../utils/debounceClick';
import useSizeTransform from '../../hooks/useSizeTransform';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import {useTranslation} from 'react-i18next';
import updateTsDomains from '../helpers/updateTsDomains';
import updateTsGfwList from '../helpers/updateTsGfwList';
import setStorageItem from '../../utils/storage/setStorageItem';
import Loading from '../../utils/ui/Loading';
import Tracking from '../../utils/tracking/Tracking';
import toastError from '../../utils/ui/toastError';
import toastSuccess from '../../utils/ui/toastSuccess';
import alertMessage from '../../utils/ui/alertMessage';
import setTrackingUserId from '../../utils/tracking/setTrackingUserId';
import PrimaryButton from '../../components/button/PrimaryButton';
import {useSafeState, clearCache} from 'ahooks';

const isEmail = require('is-email');

const ForgetPassword = ({navigation}) => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();
  const [email, setEmail] = useSafeState('');
  const [password, setPassword] = useSafeState('');
  const [showPassword, setShowPassword] = useSafeState(false);
  const [verificationCode, setVerificationCode] = useSafeState('');

  const renderIcon = props => (
    <TouchableOpacity
      onPress={() => {
        setShowPassword(!showPassword);
      }}>
      <Image
        source={!showPassword ? require('../images/icon/eye-close.png') : require('../images/icon/eye.png')}
        style={{
          width: 30,
          height: 30,
        }}
      />
    </TouchableOpacity>
  );

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
          paddingTop: 16,
          paddingBottom: 10,
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
          paddingLeft: sizeTransform(20),
          paddingRight: sizeTransform(20),
          paddingBottom: sizeTransform(20),
        }}>
        <Input
          placeholder={t('Page_ForgetPassword_InputEmailPlaceholder')}
          value={email}
          onChangeText={nextValue => setEmail(nextValue)}
        />
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: sizeTransform(20),
          paddingRight: sizeTransform(20),
          paddingBottom: sizeTransform(20),
        }}>
        <View
          style={{
            flex: 6,
          }}>
          <Input
            placeholder={t('Page_ForgetPassword_InputCaptchaPlaceholder')}
            value={verificationCode}
            onChangeText={nextValue => setVerificationCode(nextValue)}
          />
        </View>
        <View
          style={{
            paddingLeft: sizeTransform(20),
            flex: 4,
          }}>
          <Button
            status="info"
            size="small"
            onPress={debounceClick(async () => {
              // 放宽限制：支持多种账号格式，仅校验非空，其余交由服务端判定
              if (email.length === 0) {
                alert(t('Page_ForgetPassword_EmptyEmailAlert'));
                return;
              }

              // var ciphertext = CryptoJS.AES.encrypt(
              //   'HEY GOOGLE',
              //   'secret key 123',
              // ).toString();

              await Loading.show('发送中');

              try {
                fetcher(
                  API_GET_CAPTCHA,
                  {
                    username: email,
                    type: 'reset_pass',
                  },
                  true,
                )
                  .then(result => {
                    toastSuccess(result.message);
                  })
                  .catch(error => {
                    toastError(error.message);
                  });
              } catch (e) {
                alertMessage(e.message);
              } finally {
                await Loading.hide();
              }
            })}>
            {t('Page_ForgetPassword_SendCaptcha')}
          </Button>
        </View>
      </View>

      <View
        style={{
          paddingLeft: sizeTransform(20),
          paddingRight: sizeTransform(20),
          paddingBottom: sizeTransform(20),
        }}>
        <Input
          value={password}
          placeholder={t('Page_ForgetPassword_InputNewPassword')}
          accessoryRight={renderIcon}
          secureTextEntry={!showPassword}
          onChangeText={nextValue => setPassword(nextValue)}
        />
      </View>

      <View
        style={{
          padding: sizeTransform(20),
        }}>
        <PrimaryButton
          onClick={debounceClick(async () => {
            await Loading.show();
            try {
              const params = {
                username: email,
                password,
                captcha: verificationCode,
              };
              await fetcher(API_POST_RESET_PASSWORD, params);
              Tracking.info('重置密码成功');

              await toastSuccess('重置成功');

              try {
                const params1 = {
                  username: email,
                  password,
                  phoneModel: await getDeviceModel(),
                };
                const res = await fetcher(API_POST_LOGIN, params1, true);

                await setTrackingUserId(`${res.data.user.id}`);
                Tracking.info('重置且登录成功');

                // 参考旧逻辑，直接存储用户名和密码
                await setStorageItem('username', email);
                await setStorageItem('password', password);

                // 更新域名，要不下次可能打不开
                updateTsDomains();
                // 更新ACL规则
                updateTsGfwList();

                // 记录token信息
                await set('token', res.data.token);
                await set('expiredIn', res.data.expiredIn);
                await set('user', res.data.user);

                clearRequestCache();
                clearCache();

                navigation.popToTop();
                return;
              } catch (e) {
                // 尝试自动登录，失败的话，就暂时不处理
              }

              clearRequestCache();
              clearCache();

              setTimeout(() => {
                navigation.pop();
              }, 2000);
            } catch (error) {
              toastError(error.message);
            } finally {
              await Loading.hide();
            }
          })}
          title={t('Page_ForgetPassword_ResetButton')}
        />
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

export default withErrorBoundary(ForgetPassword, {
  FallbackComponent: CatchError,
});
