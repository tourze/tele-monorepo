// React Native 自动链接配置（确保 Android/iOS 能找到原生实现）
module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: 'android',
        packageImportPath: 'import com.tcpping.TcpPingPackage;',
        packageInstance: 'new TcpPingPackage()',
      },
      ios: {
        // 使用 Podspec 自动链接
      },
    },
  },
};
