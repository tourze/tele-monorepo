// Web 空实现：newrelic-react-native-agent
// 仅用于 Web 打包占位，避免引入原生 SDK 导致的告警/体积问题

type LogLevel = {
  ERROR: number;
  WARNING: number;
  INFO: number;
  VERBOSE: number;
  AUDIT: number;
};

const NewRelic = {
  LogLevel: { ERROR: 0, WARNING: 1, INFO: 2, VERBOSE: 3, AUDIT: 4 } as LogLevel,
  startAgent: (_token?: string, _config?: any) => {},
  setUserId: (_id?: string) => {},
  logInfo: (_msg?: string) => {},
  // Android 端使用到的字段，提供占位
  NRMAModularAgentWrapper: undefined as any,
  setJSAppVersion: (_v?: string) => {},
};

export default NewRelic;

