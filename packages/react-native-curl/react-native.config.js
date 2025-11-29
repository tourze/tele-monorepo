module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: "android",
        packageImportPath: "import com.reactnativecurl.CurlPackage;",
        packageInstance: "new CurlPackage()",
      },
      ios: {
        // 通过 Podspec 自动集成
      },
    },
  },
};
