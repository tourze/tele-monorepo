module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: "android",
        packageImportPath: "import com.reactnativeudp.UdpPackage;",
        packageInstance: "new UdpPackage()",
      },
      ios: {
        // 通过 Podspec 自动集成
      },
    },
  },
};
