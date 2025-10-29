---
name: js-frontend-react
description: 规范使用 React 进行前端开发，聚焦组件分层、状态管理、性能与可访问性。
---

# React 前端技能

## 适用场景
- 规划组件结构、状态归属与数据流。
- 处理性能问题（重复渲染、长列表、重计算）。
- 保证可访问性、国际化与测试覆盖。

## 前置准备
- 确认工程使用的构建工具（Vite/Webpack）与状态库（Redux/Zustand/RTK Query）。
- 了解设计系统或组件库规范。
- 引入 ESLint + React 插件、TypeScript 类型声明。

## 操作步骤
1. **组件分层**
   - 划分容器组件（数据获取/状态）与展示组件（纯渲染）。
   - 遵循文件命名：`ComponentName/index.tsx` + `ComponentName.test.tsx`。
2. **状态管理**
   - 优先使用局部状态 + `useReducer`；跨组件共享使用 Context 或 Zustand。
   - 避免 prop drilling：拆分组件或使用自定义 Hook。
   - 处理异步：结合 `React.Suspense`、`ErrorBoundary`。
3. **性能优化**
   - 使用 `React.memo`、`useMemo`、`useCallback` 避免重复渲染。
   - 长列表采用虚拟化（`react-window`/`react-virtualized`）。
   - 利用 React DevTools Profiler 捕捉渲染耗时。
4. **可访问性**
   - 使用语义化标签、`aria-*` 属性。
   - 为交互组件提供键盘操作、焦点管理。
   - 使用 `jest-axe` 或 `@testing-library/jest-dom` 断言基本 a11y。
5. **数据获取**
   - 使用 SWR/React Query 等库时关注缓存策略与错误边界。
   - 避免在渲染中直接触发副作用；在 `useEffect` 中确保依赖完整。
6. **测试策略**
   - `@testing-library/react` 编写行为测试；禁止快照反复更新。
   - E2E 使用 Playwright/Cypress 验证关键用户路径。

## 质量校验
- 运行 `npm run lint -- --max-warnings=0`、`npm run test -- --watch=false`。
- 使用 `npm run test:coverage` 确认覆盖率 ≥ 80%。
- 监控 Web Vitals（LCP、FID、CLS），通过 Lighthouse 或 Webpack Bundle Analyzer 检查包体积。

## 失败与回滚
- 引入优化导致渲染异常：保留旧版本组件，对照 diff 回退。
- 状态管理重构前备份旧 store，必要时重新导入。
- 性能改动未达标：记录测量数据并恢复旧实现。

## 交付物
- 组件树与状态图（Mermaid），说明数据流与关键分支。
- 性能/可访问性测试结果，列出优化前后对比。
- 回滚指南：涉及的组件文件、状态逻辑与依赖。
