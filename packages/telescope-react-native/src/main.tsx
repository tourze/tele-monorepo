import 'react-native-url-polyfill/auto';
import { AppRegistry, Platform } from 'react-native';
// 调试：在加载 App 之前，打印 Metro 实际解析到的 React 版本与 hooks 能力
// 便于定位“Invalid hook call”是否由多副本 React 引起
// 注意：仅开发环境打印
// eslint-disable-next-line @typescript-eslint/no-var-requires
if (__DEV__) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const reactPkg = require('react/package.json');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const React = require('react');
    // eslint-disable-next-line no-console
    console.log('[Debug][entry] react.version =', reactPkg?.version, 'useContext =', typeof React?.useContext);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('[Debug][entry] failed to read react pkg:', e?.message);
  }
}
import App from './app/App';
import { setAppId, setAppSecret } from './utils/http/callAPI';
// 为排查 hooks 异常，开发环境暂时禁用 New Relic，避免其影响初始化时序
// 如需恢复，将下面的 __DEV__ 判断改为始终启用即可
// 仅在非开发环境按需引入 New Relic，避免其额外 peer 依赖影响本地调试/打包
let NewRelic: any = undefined;
if (!__DEV__) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('newrelic-react-native-agent');
    NewRelic = mod?.default ?? mod;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[NewRelic] require failed:', (e as any)?.message);
  }
}
import getVersionName from './utils/app/getVersionName';

let appToken;
if (Platform.OS === 'ios') {
  appToken = 'AA0601f1d09994a12ada7ff8cfa1886e024accb79e-NRMA';
}
if (Platform.OS === 'android') {
  appToken = 'AA01701353ec1244c7e6c69e9a4c48c44d8c0bb39f-NRMA';
}

const agentConfiguration = {
  //Android Specific
  // Optional:Enable or disable collection of event data.
  analyticsEventEnabled: true,

  // Optional:Enable or disable crash reporting.
  crashReportingEnabled: true,

  // Optional:Enable or disable interaction tracing. Trace instrumentation still occurs, but no traces are harvested. This will disable default and custom interactions.
  interactionTracingEnabled: true,

  // Optional:Enable or disable reporting successful HTTP requests to the MobileRequest event type.
  networkRequestEnabled: true,

  // Optional:Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
  networkErrorRequestEnabled: true,

  // Optional:Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
  httpResponseBodyCaptureEnabled: true,

  // Optional:Enable or disable agent logging.
  loggingEnabled: true,

  // Optional:Specifies the log level. Omit this field for the default log level.
  // Options include: ERROR (least verbose), WARNING, INFO, VERBOSE, AUDIT (most verbose).
  logLevel: NewRelic?.LogLevel?.INFO,

  // iOS Specific
  // Optional:Enable/Disable automatic instrumentation of WebViews
  webViewInstrumentation: true,

  // Optional:Set a specific collector address for sending data. Omit this field for default address.
  // collectorAddress: "",

  // Optional:Set a specific crash collector address for sending crashes. Omit this field for default address.
  // crashCollectorAddress: ""
};

if (!__DEV__ && NewRelic?.startAgent) {
  NewRelic.startAgent(appToken, agentConfiguration);
}

let tryCount1 = 10;
function setJSAppVersion(v: string) {
  if (tryCount1 === 0) {
    return;
  }
  tryCount1--;

  let success = false;
  try {
    if (NewRelic && NewRelic.NRMAModularAgentWrapper) {
      NewRelic.setJSAppVersion(v);
      success = true;
    }
  } catch (error) {
    success = false;
  }

  if (!success) {
    setTimeout(() => {
      setJSAppVersion(v);
    }, 1000);
  }
}

// ios还没兼容到
if (Platform.OS === 'android') {
  getVersionName().then((v) => {
    setJSAppVersion(v);
  });
}

if (Platform.OS === 'android') {
  setAppId('baidu.com');
  setAppSecret('$(\'input[name="singledatePicker"]\').daterangepicker');
}
if (Platform.OS === 'ios') {
  setAppId('music.163.com');
  setAppSecret('@Order(Ordered.HIGHEST_PRECEDENCE)');
}

AppRegistry.registerComponent('TelescopeReactNative', () => App);
