---
name: js-react-state-management
description: 当需要规划 React 应用的数据层，处理状态分层、数据源同步、缓存与性能优化时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# React 状态管理技能

## 适用场景

- 中大型 React 应用需要明确数据来源、状态归属、同步策略。
- 多数据源（REST/GraphQL/WebSocket）协同，需避免重复请求与不必要渲染。
- 设计跨页面/组件共享状态、派生数据、缓存与离线策略。

## 前置准备

- 了解业务数据模型、接口契约、缓存要求。
- 明确当前框架（Next.js/Vite）、状态工具（Context、Redux Toolkit、Zustand、React Query 等）。
- 配置 TypeScript 严格模式，准备 `zod`/`valibot` 等数据校验库。

## 操作步骤

1. **状态分层**
   - 按作用域划分：局部 UI 状态（组件内）、视图范围（页面）、全局业务状态（store）。
   - 使用函数式更新、不可变数据，避免嵌套对象直接修改。
   - 将派生数据交给 `useMemo` 或 selector（如 `createSelector`）。
2. **数据源与同步**
   - 使用 React Query/SWR 等数据 fetching 库管理请求、缓存、重试。
   - 定义统一的 API Client，封装错误处理、鉴权、指纹。
   - 对实时数据使用 WebSocket / SSE + 状态库事件总线。
3. **Store 设计**
   - Redux Toolkit：使用 slice + createAsyncThunk，集中管理业务逻辑。
   - Zustand：拆分 slice，提供 selector 和 action，结合 `immer`。
   - Context 仅用于低频更新的数据（例如主题、用户信息）。
4. **表单与本地状态**
   - 复杂表单使用 `react-hook-form` + schema 校验，区分草稿与提交状态。
   - 临时缓存使用 `localStorage`/`IndexedDB` + 同步机制，确保安全与一致性。
5. **性能优化**
   - 使用 `memo`、`useMemo`、`useCallback` 避免组件重渲染。
   - 拆分 Store，使用 selector + shallow 比较。
   - 对列表启用虚拟化（React Virtualized/Window）。
   - 延迟加载：代码分割 + Suspense。
6. **错误与重试**
   - 全局错误边界：`ErrorBoundary` 捕获渲染错误。
   - 数据请求异常：React Query `retry`, `onError`, `useErrorBoundary`。
   - 指定重试策略、指数退避、最大失败次数。
7. **调试与观测**
   - Redux DevTools/Zustand devtools 跟踪状态变化。
   - React Profiler 分析渲染开销。
   - 使用日志工具记录关键状态变更（可在开发环境启用）。

## 质量校验

- 单元/组件测试覆盖状态逻辑，使用 Testing Library + Hook 测试。
- E2E 测试验证状态持久化、回退、恢复流程。
- Lint/TypeScript 无错误；React Query devtools、Profiler 指标稳定。

## 失败与回滚

- 状态树膨胀：重新拆分 store，回滚引入状态的数据结构。
- 性能下降：收集 profile 数据，恢复最近一次改动并逐项分析。
- 缓存失效或数据不一致：撤销缓存策略，启用安全默认值并补充校验。

## 交付物

- 状态图（Mermaid）：数据源、store、组件之间的关系。
- Store 定义、API 客户端、同步策略说明。
- 测试与性能报告、调试工具配置。
