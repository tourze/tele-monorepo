const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
// 注意：某些 Metro 版本不从根导出 exclusionList，需要用内部路径
const exclusionList = require('metro-config/src/defaults/exclusionList');
const path = require('path');
const { getJsoConfig } = require('./config/jso');

const defaultConfig = getDefaultConfig(__dirname);
const { assetExts, sourceExts } = defaultConfig.resolver;

const jsoMetroPlugin = require('obfuscator-io-metro-plugin')(
  getJsoConfig(),
  {
    runInDev: false /* optional */,
    logObfuscatedFiles: true /* optional generated files will be located at ./.jso */,
  },
);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const rootReact = path.resolve(__dirname, '../../node_modules/react');
const rootRN = path.resolve(__dirname, '../../node_modules/react-native');

const customConfig = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'cjs', 'mjs', 'svg'],
    // 允许解析 package.json 的 exports 字段，兼容 ESM 包（如 string-strip-html）
    unstable_enablePackageExports: true,
    // 明确指定 node_modules 搜索路径，兼容 Yarn Workspaces 提升依赖到仓库根目录的情况
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
    ],
    // 关闭层级查找，强制只在 nodeModulesPaths 内查找，避免误命中其他工作区的 React
    disableHierarchicalLookup: true,
    // 强制所有包共用同一份 react/react-native，避免 hooks 多副本错误
    extraNodeModules: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
    },
    // 阻止从工作区包自身的 node_modules 里意外解析到 react/react-native
    blockList: exclusionList([
      /packages\/[^/]+\/node_modules\/react(\/|$)/,
      /packages\/[^/]+\/node_modules\/react-native(\/|$)/,
    ]),
  },
  // 监控 monorepo 根的 node_modules 与 packages，确保能解析工作区内源代码与被提升的依赖
  watchFolders: [
    path.resolve(__dirname, '../../node_modules'),
    path.resolve(__dirname, '../../packages'),
  ],
  ...jsoMetroPlugin,
};

module.exports = mergeConfig(defaultConfig, customConfig);
