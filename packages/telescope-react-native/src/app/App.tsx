/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

// 参考 https://moonapi.com/news/10796.html
// ICON最好统一使用 https://www.iconfont.cn/collections/detail?cid=42127

import React, {useEffect} from 'react';
// 调试：打印当前打包时使用的 React 版本与能力，定位 hooks 异常根因
// 注意：仅开发环境输出
if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore
  // eslint-disable-next-line no-console
  console.log('[Debug] React.version =', (React as any)?.version, 'useContext =', typeof (React as any)?.useContext);
}
import {NativeModules, Platform} from 'react-native';
import * as eva from '@eva-design/eva';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import i18n from 'i18next';
import {initReactI18next, useTranslation} from 'react-i18next';
import {resources} from './i18n/index';
import Home from './routes/Home';
import ShareIndex from './routes/ShareIndex';
import PricingPlan from './routes/PricingPlan';
import LoginScreen from './routes/Login';
import AboutUsPage from './routes/AboutUs';
import RouteList from './routes/RouteList';
import MessageListPage from './routes/MessageList';
import CouponFormPage from './routes/CouponForm';
import CouponListPage from './routes/CouponList';
import RechargeListPage from './routes/RechargeList';
import NetworkProtectPage from './routes/NetworkProtect';
import AdvancedSettingPage from './routes/AdvancedSetting';
import UserCenter from './routes/UserCenter';
import LandingPage from './routes/Landing';
import InviteInfo from './routes/InviteInfo';
import ForgetPassword from './routes/ForgetPassword';
import useAppState from '../hooks/useAppState';
import getStorageItem from '../utils/storage/getStorageItem';
import setStorageItem from '../utils/storage/setStorageItem';
import Tracking from '../utils/tracking/Tracking';
import WebViewPage from './routes/WebView';
import LoadingContainer from '../utils/ui/LoadingContainer';
import requestAppProtect from '../utils/permission/requestAppProtect';
import ToastManager from '../utils/ui/ToastManager';
import {useMemoizedFn} from 'ahooks';
import BootSplash from 'react-native-bootsplash';
import {ApplicationProvider, IconRegistry} from '../react-native-ui-kitten/components';
import {EvaIconsPack} from '../react-native-ui-kitten/eva-icons';
import { setSiteDomain } from '../utils/network/getSiteDomain';
import { setDefaultApiDomains } from '../utils/network/getDefaultApiDomains';
import PlayIndexPage from './routes/play/Index';
import AppIndexPage from './routes/play/AppIndex';
import StarIndexPage from './routes/play/StarIndex';
import { apiDomains } from '../config';

// 官网
setSiteDomain('https://telescopes.vip');

// 主API域名列表
setDefaultApiDomains(apiDomains);

// console.log('NativeModules', NativeModules);
// const {TTManager} = NativeModules;
// console.log('TTManager所有方法', Object.keys(TTManager));
// MacOS：[
//     "startPing",
//     "setConfig",
//     "getConfig",
//     "getSystemVersion",
//     "getVersionCode",
//     "getVersionName",
//     "getChannelName",
//     "getAppInfo",
//     "exitApp",
//     "getFileSHA1Sum",
//     "getHomeDirectory",
//     "createMacosDirectory",
//     "removeMacosFile",
//     "writeMacosFile",
//     "getSSLocalStatus",
//     "reloadSSLocal",
//     "startSSLocal",
//     "stopSSLocal",
//     "installSSLocal",
//     "getPrivoxyStatus",
//     "reloadPrivoxy",
//     "installPrivoxy",
//     "stopPrivoxy",
//     "startPrivoxy",
//     "getGostStatus",
//     "reloadGost",
//     "startGost",
//     "stopGost",
//     "installGost",
//     "getTun2socksStatus",
//     "startTun2sock",
//     "stopTun2sock",
//     "getConstants"
// ]

// MacOS用来测试返回配置信息
// if (TTManager.getAppInfo) {
//   TTManager.getAppInfo((error, info) => {
//     console.log('TTManager.getAppInfo', error, info);
//   });
// }

// TCP测速
// TTManager.startPing('www.baidu.com', 80, 4)
//   .then(result => {
//     // MacOS {
//     //     "avgTime": 60.22951006889343,
//     //     "code": 0,
//     //     "count": 4,
//     //     "ip": "120.232.145.185",
//     //     "loss": 0,
//     //     "maxTime": 95.8949327468872,
//     //     "minTime": 45.12500762939453,
//     //     "stddev": 20.68547948254719,
//     //     "totalTime": 17155.84397315979
//     // }
//     // Android {
//     //     totalTime: 7,
//     //     loss: 0,
//     //     stddev: 0,
//     //     count: 4,
//     //     avgTime: 8,
//     //     maxTime: 12,
//     //     ip: '120.232.145.185',
//     //     minTime: 5,
//     //     code: 0
//     //  }
//     console.info('startPing success', result);
//   })
//   .catch(error => {
//     console.error('startPing error', error);
//   });

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // the translations
    // (tip move them in a JSON file and import them,
    // or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files#manage-your-translations-with-a-management-gui)
    resources,
    lng: 'cn', // if you're using a language detector, do not define the lng option
    fallbackLng: 'cn',

    compatibilityJSON: 'v3',

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

// 记录初始的硬件信息
// console.log('NativeModules.TTManager.generateSystemReport', NativeModules.TTManager.generateSystemReport);

const Stack = createNativeStackNavigator();

function App() {
  const {t, i18n} = useTranslation();

  // 当前State切换变化
  const currentAppState = useAppState();
  useEffect(() => {
    Tracking.info('当前AppState', {
      appState: currentAppState,
    });

    requestAppProtect();
  }, [currentAppState]);

  // 启动时设置默认语言
  useEffect(() => {
    (async () => {
      await BootSplash.hide({fade: true});

      const sRes = await getStorageItem('language');
      if (sRes) {
        await i18n.changeLanguage(sRes);
        return;
      }

      // 根据运行环境，自动判断
      // const locale = await NativeModules.TTManager.getLocale();
      const res = 'cn';
      // if (locale.includes('en-') || locale.includes('en_')) {
      //   res = 'en';
      // }
      // if (locale.includes('RU')) {
      //   res = 'ru';
      // }
      // if (locale.includes('Hans') || locale.includes('zh_CN') || locale.includes('zh-CN')) {
      //   res = 'cn';
      // }
      // if (locale.includes('Hant') || locale.includes('zh-HK') || locale.includes('zh_HK') || locale.includes('zh-TW') || locale.includes('zh_TW')) {
      //   res = 'tc';
      // }
      setStorageItem('language', `${res}`);
    })();
  }, []);

  // console.log('Platform.OS', Platform.OS);

  // const dimensions = useWindowDimensions();
  // console.log('dimensions.width', dimensions.width);
  // console.log('dimensions.height', dimensions.height);

  const onReady = useMemoizedFn(function () {
    // 参考 https://github.com/zoontek/react-native-bootsplash#how-should-i-use-it-with-react-navigation
    if (NativeModules.SplashScreen) {
      NativeModules.SplashScreen.hide();
    }
  });

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        <NavigationContainer onReady={onReady}>
          <Stack.Navigator
            screenOptions={Platform.select({
              web: {
                headerBackImageSource: require('./images/back.png'),
              },
            })}>
            <Stack.Screen
              name="LandingPage"
              component={LandingPage}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Home"
              component={Home}
              options={{
                headerShown: false,
                title: t('Navigation_Title_HomePage'),
            }}
            />
            <Stack.Screen
              name="ShareIndex"
              component={ShareIndex}
              options={{
                title: t('Navigation_Title_ShareIndex'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="PricingPlan"
              component={PricingPlan}
              options={{
                title: t('Navigation_Title_PricingPlan'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                title: t('Navigation_Title_LoginScreen'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ForgetPassword"
              component={ForgetPassword}
              options={{
                title: t('Navigation_Title_ForgetPassword'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="AboutUs"
              component={AboutUsPage}
              options={{
                title: t('Navigation_Title_AboutUsPage'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="RouteList"
              component={RouteList}
              options={{
                title: t('Navigation_Title_RouteList'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="MessageList"
              component={MessageListPage}
              options={{
                title: t('Navigation_Title_MessageListPage'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="CouponForm"
              component={CouponFormPage}
              options={{
                title: t('Navigation_Title_CouponFormPage'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="CouponList"
              component={CouponListPage}
              options={{
                title: t('Navigation_Title_CouponListPage'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="RechargeList"
              component={RechargeListPage}
              options={{
                title: t('Navigation_Title_RechargeListPage'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="NetworkProtect"
              component={NetworkProtectPage}
              options={{
                title: t('Navigation_Title_NetworkProtectPage'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="AdvancedSetting"
              component={AdvancedSettingPage}
              options={{
                title: t('Navigation_Title_AdvancedSettingPage'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="UserCenter"
              component={UserCenter}
              options={{
                title: t('Navigation_Title_UserCenter'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="WebView"
              component={WebViewPage}
              options={{headerTitleAlign: 'center'}}
            />
            <Stack.Screen
              name="InviteInfo"
              component={InviteInfo}
              options={{
                title: t('Navigation_Title_InviteInfo'),
                headerTitleAlign: 'center',
              }}
            />

            <Stack.Screen
              name="PlayIndexPage"
              component={PlayIndexPage}
              options={{
                title: t('Navigation_Title_PeoplePlay'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="AppIndexPage"
              component={AppIndexPage}
              options={{
                title: t('Navigation_Title_OutsideApp'),
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="StarIndexPage"
              component={StarIndexPage}
              options={{
                title: t('Navigation_Title_OutsideStar'),
                headerTitleAlign: 'center',
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ApplicationProvider>
      <LoadingContainer />
      <ToastManager />
    </>
  );
}

export default App;

// const styles = StyleSheet.create({
//   root: {
//     height: "100%",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "white",
//   },
//   logo: {
//     width: 120,
//     height: 120,
//     marginBottom: 20,
//   },
//   text: {
//     fontSize: 28,
//     fontWeight: "600",
//   },
//   platformRow: {
//     marginTop: 12,
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   platformValue: {
//     fontSize: 28,
//     fontWeight: "500",
//   },
//   platformBackground: {
//     backgroundColor: "#ececec",
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: "#d4d4d4",
//     paddingHorizontal: 6,
//     borderRadius: 6,
//     alignItems: "center",
//   },
//   container: {
//     flex: 1,
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
// });
