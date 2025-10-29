---
name: js-tool-vite-bundler
description: 使用 Vite 构建前端应用，涵盖配置、性能优化、环境变量与部署策略。
---

# Vite 构建技能

## 适用场景
- 配置 Vite 项目、处理别名、插件、环境变量。
- 优化构建性能、分析包体积、处理 SSR/CSR 差异。
- 解决构建错误、部署失败或浏览器兼容问题。

## 前置准备
- 确认 `vite.config.ts` 存在，安装 `vite`、`@vitejs/plugin-react` 等。
- 熟悉 `package.json` 的脚本，如 `dev`、`build`、`preview`。
- 明确部署目标（静态站点、SSR、Hybrid）。

## 操作步骤
1. **基础命令**
   - 开发：`pnpm vite --host`.
   - 构建：`pnpm vite build`.
   - 预览：`pnpm vite preview --host`.
2. **配置管理**
   - 使用 `defineConfig`，按环境拆分配置或通过 `mode` 加载 `.env`.
   - 设置路径别名：
     ```ts
     resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
     ```
   - 插件：React 项目启用 `@vitejs/plugin-react-swc`，SSR 使用 `plugin-ssr`.
3. **环境变量**
   - 在 `.env` 中定义 `VITE_` 前缀变量；通过 `import.meta.env` 访问。
   - 使用 `dotenv` 管理多环境（dev/staging/prod），禁止硬编码。
4. **性能优化**
   - 代码分割：`build.rollupOptions.output.manualChunks` 将大依赖拆包。
   - 预构建：`optimizeDeps.include/exclude` 调整依赖预构建行为。
   - 使用 `pnpm vite build --report` 或 `rollup-plugin-visualizer` 分析体积。
5. **故障排查**
   - 构建失败：启用 `--debug` 查看详细日志。
   - SSR 问题：检查 `ssr.noExternal` 与服务端依赖。
   - 浏览器兼容：设置 `build.target` 与 `esbuild` 转译选项。

## 质量校验
- 构建命令成功，产物输出到 `dist/`。
- 运行 `pnpm lint && pnpm test`，确保构建对其他质量门无影响。
- 部署前使用 `pnpm vite preview` 自测核心路径。

## 失败与回滚
- 插件升级导致异常：固定版本，必要时回退 `package.json` 与 `pnpm-lock.yaml`。
- 构建产物错误：保留旧版本 `dist` 备份，回滚到稳定配置。
- 环境变量配置错误：恢复 `.env`，并在 CI 中增加校验脚本。

## 交付物
- 更新后的 `vite.config.ts`、`.env` 差异说明。
- 性能分析报告（bundle 体积、构建耗时）。
- 部署/回滚步骤与验证清单。
