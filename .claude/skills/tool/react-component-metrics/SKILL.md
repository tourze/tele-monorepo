---
name: react-component-metrics
description: 用于度量 React 组件的渲染耗时、交互响应与包体积，指导性能回归监控与优化决策。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# React 组件度量技能

## 适用场景

- 新增/重构组件需要给出性能基线与目标（渲染耗时、交互延迟、Web Vitals）。
- 线上监控提示页面抖动、CLS/LCP 异常或包体积膨胀，需要快速定位。
- 构建 PR 需附带量化数据，证明不会引入性能回归。

## 前置准备

- 安装 React DevTools、Chrome Performance 面板、`why-did-you-render`（开发）。
- 为项目引入 `web-vitals`, `React.Profiler`, `@testing-library/react`, `@axe-core/react`（可选）。
- 准备 `npm run build`, `npm run analyze`（Webpack Bundle Analyzer/Vite --analyze）命令。
- 在 `.env` 中配置可切换的度量开关，避免生产污染。

## 操作步骤

1. **定义指标与场景**
   - 选择可观测指标：首次渲染时间、交互响应（TTI）、渲染提交耗时、Web Vitals（LCP/FID/CLS）。
   - 制定代表用户路径：首屏加载、分页切换、表单提交等。
2. **配置采集工具**
   - 在目标组件外包裹 `React.Profiler`，记录 `id`, `phase`, `actualDuration`, `baseDuration`：

     ```tsx
     <React.Profiler id="OrderList" onRender={reportRender}>
       <OrderList {...props} />
     </React.Profiler>
     ```

   - 开启 React DevTools Profiler 的 “Record why each component rendered” 选项。
   - 在浏览器注入 `web-vitals` 监听，将数据上报到日志或 `console.table`。
3. **采集与比对**
   - 使用 Chrome Performance panel 或 `pnpm vitest --runInBand --profiler`（视项目脚本而定）录制交互。
   - 执行 `npm run analyze` 获取 bundle 体积分布，关注组件所属 chunk。
   - 对照基线记录，将 `actualDuration`、Web Vitals 与历史值对比，找出 >10% 波动。
4. **诊断瓶颈**
   - 借助 `why-did-you-render` 或 Profiler flamechart 发现多余渲染，重点排查 props 引用变更、上下文更新。
   - 检查 `Suspense` 和数据请求并发策略，评估是否需要分片渲染或懒加载。
   - 若问题来自 CSS/动画，使用 Chrome Rendering Stats 或 `prefers-reduced-motion` 方案。
5. **固化结果**
   - 将指标写入 PR 描述或监控仪表板，附上截图/日志链接。
   - 在 CI 中添加预算校验（例如 Lighthouse CI、`bundlesize`、自定义脚本），低于阈值才允许合并。

## 质量校验

- 度量脚本可重复执行，记录包含时间、环境、提交哈希。
- 优化前后差异透明，能解释造成波动的代码路径。
- 指标与业务 KPI 对齐（例如订单列表交互 < 100ms），并在监控中持续追踪。

## 失败与回滚

- Profiler/监控影响性能：仅在调试环境启用，或通过动态导入分离。
- 指标误读导致误优化：保留原始录制文件，复核取样方法。
- CI 阈值设置过严阻塞交付：临时放宽但需记录豁免，并创建跟踪任务恢复。

## 交付物

- Profiler 录制文件、Web Vitals 日志或 Lighthouse 报告。
- Bundle 分析截图与组件所属 chunk 列表。
- CI 指标配置（脚本/阈值）及监控链接，方便后续复查。
