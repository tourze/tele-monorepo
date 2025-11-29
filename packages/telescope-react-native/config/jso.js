var WebpackObfuscator = require('webpack-obfuscator');
const path = require('path');
const { getRandomIntInRange } = require('./random');

class FilterSourceMapsWarnings {
  apply(compiler) {
    compiler.options.ignoreWarnings.push(
      (x) => /Failed to parse source/.test(x)
    );
  }
}

/**
 * 通用的混淆配置
 *
 * @returns {{stringArrayCallsTransformThreshold: number, controlFlowFlatteningThreshold: number, identifierNamesGenerator: string, compact: boolean, seed: *, sourceMap: boolean, log: boolean, splitStrings: boolean, stringArray: boolean, simplify: boolean, splitStringsChunkLength: *, controlFlowFlattening: boolean}}
 */
function getJsoConfig() {
  return {
    // 压缩代码
    compact: true,

    // 随机的死代码块(增加了混淆代码的大小)
    //deadCodeInjection: true,
    // 死代码块的影响概率
    //deadCodeInjectionThreshold: getRandomIntInRange(1, 3) / 10,

    // source Map generated after obfuscation is not useful right now so use default value i.e. false
    sourceMap: false,

    // 是否启用控制流扁平化(降低1.5倍的运行速度)
    controlFlowFlattening: true,
    // 应用概率;在较大的代码库中，建议降低此值，因为大量的控制流转换可能会增加代码的大小并降低代码的速度。
    controlFlowFlatteningThreshold: getRandomIntInRange(10, 25) / 100,

    identifierNamesGenerator: 'mangled-shuffled',
    seed: getRandomIntInRange(1, 99999999),
    simplify: true,

    // 通过用空函数替换它们来禁用console.log，console.info，console.error和console.warn。这使得调试器的使用更加困难。
    disableConsoleOutput: true,

    // 通过固定和随机（在代码混淆时生成）的位置移动数组。这使得将删除的字符串的顺序与其原始位置相匹配变得更加困难。
    // 如果原始源代码不小，建议使用此选项，因为辅助函数可以引起注意。
    rotateStringArray: true,

    // 删除字符串文字并将它们放在一个特殊的数组中
    stringArray: true,
    //stringArrayEncoding: ['rc4'],
    //stringArrayThreshold: getRandomIntInRange(10, 20) / 100,
    // stringArrayCallsTransform: true,
    // stringArrayCallsTransformThreshold: getRandomIntInRange(50, 99) / 100,

    // splitStrings: true,
    // splitStringsChunkLength: getRandomIntInRange(2, 6),

    log: false,
  };
}

function getWebPackPlugins(isProd = true) {
  //return [];
  // 生产环境才用
  if (!isProd) {
    return [
      new FilterSourceMapsWarnings(),
    ];
  }
  console.log('生产环境，开启JS代码混淆');
  return [
    new FilterSourceMapsWarnings(),
    new WebpackObfuscator (getJsoConfig(), [
      'node_modules/**',
    ]),
  ];
}

function getResolveAlias() {
  // TODO web/tauri环境的话，这里应该引用专有路径

  return {
    'react-native$': 'react-native-web',
    'react-native-webview': 'react-native-web-webview',
    // Web 环境下不使用新遗留埋点 SDK，提供空实现
    'newrelic-react-native-agent': path.resolve(__dirname, '../src/web/shims/newrelicAgent.ts'),
    // 显式指向已安装的 Reanimated，避免某些包 try/catch require 触发解析误报
    'react-native-reanimated$': path.resolve(__dirname, '../node_modules/react-native-reanimated'),
  };
}

module.exports = {
  getJsoConfig,
  getWebPackPlugins,
  getResolveAlias,
}
