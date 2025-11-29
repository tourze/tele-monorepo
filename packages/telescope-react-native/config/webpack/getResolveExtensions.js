function getResolveExtensions() {
  console.log('process.env', process.env);
  //  {
  //   TAURI_ENV_DEBUG: 'true',
  //   TAURI_ENV_TARGET_TRIPLE: 'aarch64-apple-darwin',
  //   TAURI_ENV_PLATFORM: 'darwin',
  //   TAURI_ENV_PLATFORM_VERSION: '15.1.0',
  //   TAURI_ENV_FAMILY: 'unix',
  //   TAURI_ENV_ARCH: 'aarch64',
  //   TAURI_CHANNEL: 'GW',
  // }
  const fileExtensions = [];
  // 如果是tauri的话，我们考虑再加载一次tauri后缀
  if (process.env.TAURI_ENV_TARGET_TRIPLE !== undefined) {
    fileExtensions.push('.tauri.tsx');
    fileExtensions.push('.tauri.ts');
    fileExtensions.push('.tauri.jsx');
    fileExtensions.push('.tauri.js');
  }

  // Web 端优先
  fileExtensions.push('.web.tsx');
  fileExtensions.push('.web.ts');
  fileExtensions.push('.web.jsx');
  fileExtensions.push('.web.js');

  // 兜底：常规后缀，确保能解析到通用实现
  fileExtensions.push('.tsx');
  fileExtensions.push('.ts');
  fileExtensions.push('.jsx');
  fileExtensions.push('.js');
  fileExtensions.push('.json');

  console.log('额外加载后缀', fileExtensions);
  return fileExtensions;
}

module.exports = {
  getResolveExtensions,
};
