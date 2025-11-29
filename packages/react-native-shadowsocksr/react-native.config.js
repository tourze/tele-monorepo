// React Native 自动链接配置（Android 使用 TurboPackage；iOS 先占位）
module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: 'android',
        packageImportPath: 'import com.example.ssr.ShadowsocksRPackage;',
        packageInstance: 'new ShadowsocksRPackage()',
      },
      ios: {
        // 使用 Podspec 自动链接（后续补充具体实现）
      },
    },
  },
};

