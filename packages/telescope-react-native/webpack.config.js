const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const { defineEnvVariablesPlugin } = require('./config/webpack/definePlugin');
const { getResolveExtensions } = require('./config/webpack/getResolveExtensions');
const path = require('path');
const { getWebPackPlugins, getResolveAlias } = require('./config/jso');

module.exports = (env, argv) => {
  const isProd = argv && argv.mode === 'production';
  return {
  module: {
    rules: [
      {
        // 编译项目源码中的 TS/TSX/JS/JSX
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // 走本项目的 .babelrc.js（已包含 React Native 相关预设，支持 TSX）
            // 关闭缓存，避免 Node OpenSSL 3 与旧哈希算法兼容性问题
            cacheDirectory: false,
            envName: isProd ? 'production' : 'development',
          },
        },
      },
      // {
      //   test: /\.(js|jsx|ts|tsx)$/,
      //   include: /node_modules/,
      //   use: [
      //     {
      //       loader: path.resolve(__dirname, '../../shared/config/loaders/debug-loader.js'),
      //     },
      //   ],
      // },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: (modulePath) => /node_modules[\\\/](@?react-native|@react-navigation|newrelic-react-native-agent)/.test(modulePath),
        use: {
          loader: 'babel-loader',
          options: {
            // 使用通用预设，覆盖 Flow 与 TS 场景
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-flow',
              '@babel/preset-typescript',
            ],
            envName: isProd ? 'production' : 'development',
          }
        },
      },
      {
        // 处理普通 CSS 文件
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            }
          },
        ],
      },
      {
        // 常见图片资源
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][hash][ext]'
        }
      },
      {
        test: /postMock.html$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      },
    ],
  },
  ignoreWarnings: [],
  resolve: {
    alias: getResolveAlias(),
    extensions: getResolveExtensions(),
    // 让从根 node_modules 解析的三方包也能定位到本工作区的依赖（如 react-native-web）
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules'),
      'node_modules',
    ],
  },
  devServer: {
    port: 4200,
  },
  entry: './src/main-web.tsx',
  output: {
    path: path.resolve(__dirname, 'dist/apps/telescope-react-native'),
    filename: process.env['NODE_ENV'] === 'production' ? '[name].[contenthash].js' : '[name].js',
    publicPath: '/',
  },
  // 生产环境关闭 source map，避免路径信息进入产物
  devtool: isProd ? false : 'eval-cheap-module-source-map',
  // 让 webpack 默认的 production 优化生效（会自动最小化、移除注释）
  optimization: {},
  performance: {
    // Web 端不关注打包体积告警
    hints: false,
  },
  plugins: [
    defineEnvVariablesPlugin(isProd),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    !isProd && new ReactRefreshWebpackPlugin(),
    ...getWebPackPlugins(isProd),
  ].filter(Boolean),
  };
};
