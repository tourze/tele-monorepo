// 根目录的 PostCSS 配置，解决工作区依赖被 hoist 后在 node_modules 中解析不到局部配置的问题
// 仅启用 autoprefixer，与 apps/zpace-cms-client 的 package.json 中配置保持一致
module.exports = {
  plugins: {
    // 使用默认配置即可
    autoprefixer: {},
  },
}

