import React, {useEffect, useCallback, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {Input} from '../../react-native-ui-kitten/components';
import { useInterval, useSafeState, useDebounceFn } from 'ahooks';
import {fetcher} from '../hooks/useRequest';
import {
  API_GET_CAPTCHA,
} from '../constants';
import useSizeTransform from '../../hooks/useSizeTransform';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import {useTranslation} from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/core';
import toastError from '../../utils/ui/toastError';
import toastSuccess from '../../utils/ui/toastSuccess';
import Loading from '../../utils/ui/Loading';
import SuccessButton from '../../components/button/SuccessButton';
import LoginButton from './login/LoginButton';
import RegButton from './login/RegButton';

const isEmail = require('is-email');

const LoginScreen = ({navigation}) => {
  const {t} = useTranslation();
  const route: any = useRoute();
  const nav: any = useNavigation();
  const sizeTransform = useSizeTransform();
  const [email, setEmail] = useSafeState('');
  const [password, setPassword] = useSafeState('');
  const [showPassword, setShowPassword] = useSafeState(false);
  // 记录用户是否主动切换过明文/密文，以避免后续自动逻辑打断用户选择
  const touchedShowPasswordRef = useRef(false);
  const [mode, setMode] = useSafeState('login');
  const [verificationCode, setVerificationCode] = useSafeState('');
  const [sendCodeWaitTime, setSendCodeWaitTime] = useSafeState(0);

  // 试用引导场景：默认显示注册表单
  useEffect(() => {
    if (route?.params?.allowSkip) {
      setMode('resetPassword');
    }
  }, [route?.params?.allowSkip]);

  useEffect(() => {
    navigation.setOptions({
      title: mode === 'login' ? t('Login') : t('Register'),
    });
  }, [mode, t]);

  // 注册时：若为"账号注册"（非邮箱格式），默认使用明文展示密码，便于用户截图保存
  useEffect(() => {
    if (!touchedShowPasswordRef.current) {
      if (mode !== 'login') {
        setShowPassword(!isEmail(email) ? true : false);
      } else {
        setShowPassword(false);
      }
    }
  }, [mode, email]);

  // 若允许跳过，则在导航栏加入“跳过”入口
  useEffect(() => {
    if (route?.params?.allowSkip) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => {
              const next = route?.params?.next;
              if (next) {
                // 直接替换为目标页（保留底层Home）
                nav.replace(next);
              } else {
                nav.goBack();
              }
            }}
            style={{ paddingHorizontal: 12 }}
          >
            <Text style={{ color: '#666' }}>{t('Skip') || '跳过'}</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [route, navigation, nav, t]);

  useInterval(() => {
    if (sendCodeWaitTime <= 0) {
      return;
    }
    setSendCodeWaitTime(prevState => {
      return prevState - 1;
    });
  }, 1000);

  const toggleMode = useCallback(() => {
    setMode(mode === 'login' ? 'resetPassword' : 'login');
  }, [mode, setMode]);

  const gotoForgetPassword = useCallback(() => {
    navigation.push('ForgetPassword');
  }, [navigation]);

  const switchShowPassword = useCallback(() => {
    touchedShowPasswordRef.current = true;
    setShowPassword(!showPassword);
  }, [setShowPassword, showPassword]);

  const renderIcon = props => (
    <TouchableOpacity onPress={switchShowPassword}>
      <Image
        source={!showPassword ? require('../images/icon/eye-close.png') : require('../images/icon/eye.png')}
        style={{
          width: 30,
          height: 30,
        }}
      />
    </TouchableOpacity>
  );

  const renderActionButton = () => {
    if (mode === 'login') {
      return <LoginButton email={email} password={password} />;
    }
    return <RegButton email={email} password={password} verificationCode={verificationCode} />;
  };

  const sendCodeButtonClick = useDebounceFn(async () => {
    // 放宽限制：支持多种账号格式（邮箱或普通账号），仅校验非空，其余交由服务端判定
    if (email.length === 0) {
      alert(t('Page_Login_EmptyEmailAlert'));
      return;
    }

    // var ciphertext = CryptoJS.AES.encrypt(
    //   'HEY GOOGLE',
    //   'secret key 123',
    // ).toString();

    await Loading.show('提交中');
    fetcher(
      API_GET_CAPTCHA,
      {
        username: email,
      },
      true,
    )
      .then(result => {
        toastSuccess(result.message);
        setSendCodeWaitTime(60);
      })
      .catch(error => {
        toastError(error.message);
        setSendCodeWaitTime(0);
      })
      .finally(() => {
        Loading.hide();
      });
  }, { leading: true, trailing: false });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      {/* 试用引导提示区域：当允许跳过时显示，避免用户疑惑 */}
      {route?.params?.allowSkip && (
        <View
          style={{
            backgroundColor: '#FFF7E6',
            borderColor: '#FFE7BA',
            borderWidth: 1,
            margin: 16,
            marginBottom: 0,
            padding: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#8C6D1F', lineHeight: 20 }}>
            您当前是游客ID。为保障账号安全与数据不丢失，建议先登录或注册绑定账号。
          </Text>
          <Text style={{ color: '#8C6D1F', marginTop: 6, lineHeight: 20 }}>
            {route?.params?.next === 'RouteList'
              ? '完成登录/注册后将自动进入"选择线路"。如暂时不想绑定，右上角可"跳过"继续试用。'
              : '如暂时不想绑定，右上角可"跳过"继续试用。'}
          </Text>
        </View>
      )}

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
          placeholder={t('Page_Login_InputEmailPlaceholder')}
          value={email}
          onChangeText={nextValue => setEmail(nextValue)}
        />
      </View>

      <View
        style={{
          paddingLeft: sizeTransform(20),
          paddingRight: sizeTransform(20),
          paddingBottom: sizeTransform(20),
        }}>
        <Input
          value={password}
          placeholder={t('Page_Login_InputPasswordPlaceholder')}
          accessoryRight={renderIcon}
          // 注册且为“用户名注册”时，默认明文展示密码
          secureTextEntry={!showPassword}
          onChangeText={nextValue => setPassword(nextValue)}
        />
      </View>

      {/* 账号注册提示：建议截图保存账号密码 */}
      {mode !== 'login' && !isEmail(email) && (
        <View
          style={{
            backgroundColor: '#FFF7E6',
            borderColor: '#FFE7BA',
            borderWidth: 1,
            marginHorizontal: 16,
            marginTop: -8,
            marginBottom: 12,
            padding: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#8C6D1F', fontSize: 12, lineHeight: 18 }}>
            提示：当前使用"账号注册"（非邮箱格式），请妥善保存并截图留存您的账号与密码，遗失将无法找回。
          </Text>
        </View>
      )}

      {mode !== 'login' && isEmail(email) && (
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingLeft: sizeTransform(20),
            paddingRight: sizeTransform(20),
            paddingBottom: sizeTransform(20),
          }}>
          <View
            style={{
              flex: 6,
            }}>
            <Input
              placeholder={t('Page_Login_InputCaptchaPlaceholder')}
              value={verificationCode}
              onChangeText={nextValue => setVerificationCode(nextValue)}
            />
          </View>
          <View
            style={{
              flex: 4,
              paddingLeft: sizeTransform(20),
            }}>
            <SuccessButton
              title={`${t('Page_Login_SendCaptcha')} ${sendCodeWaitTime > 0 ? sendCodeWaitTime : ''}`}
              size='small'
              onClick={sendCodeButtonClick.run}
              disabled={sendCodeWaitTime > 0}
            />
          </View>
        </View>
      )}

      {renderActionButton()}

      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: sizeTransform(20),
        }}>
        <TouchableOpacity onPress={toggleMode}>
          <Text style={{color: '#666'}}>
            {mode === 'login' ? t('Register') : t('Login')}
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 5,
        }}>
        <TouchableOpacity onPress={gotoForgetPassword}>
          <Text style={{color: '#666'}}>{t('Page_Login_ForgetPassword')}</Text>
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

export default withErrorBoundary(LoginScreen, {
  FallbackComponent: CatchError,
});
