const path = require('path');
const webpack = require('webpack');

function defineEnvVariablesPlugin(isProd = false) {
  const fileDep = path.resolve(__dirname, '../../../.git/index');

  const vars = {
    // 交由 webpack 的 mode 控制 NODE_ENV，避免冲突告警
    'process.env.TAURI_PLATFORM': JSON.stringify(
      process.env.TAURI_PLATFORM || 'web',
    ),
    'process.env.TAURI_CHANNEL': JSON.stringify(
      process.env.TAURI_CHANNEL || 'GW',
    ),
    'process.env.COMMIT_REF': JSON.stringify(process.env.COMMIT_REF),
    // 与 webpack mode 保持一致，避免产物中出现开发标记
    __DEV__: !isProd,
    BUILT_AT: webpack.DefinePlugin.runtimeValue(Date.now, {
      fileDependencies: [fileDep],
    }),
  };
  console.log('静态替换变量', vars);

  return new webpack.DefinePlugin(vars);
}

module.exports = {
  defineEnvVariablesPlugin
};
