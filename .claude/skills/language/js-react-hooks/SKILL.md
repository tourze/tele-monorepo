---
name: js-react-hooks
description: 设计与实现 React Hooks，确保可复用、性能稳定、遵循规则与测试策略。
---

# React Hooks 技能

## 适用场景
- 封装可复用逻辑（数据获取、事件订阅、表单、动画）。
- 管理副作用、依赖数组、资源释放，避免竞态。
- 编写 Hook 单元测试、使用 ESLint 规则、对外暴露明确 API。

## 前置准备
- 启用 `eslint-plugin-react-hooks`，确保规则检查。
- 使用 TypeScript 定义 Hook 输入/输出类型、泛型。
- 准备测试工具：Testing Library Hooks (`@testing-library/react`) 或 Vitest 内嵌渲染器。

## 操作步骤
1. **命名与约定**
   - Hook 必须以 `use` 开头，文件命名 `useXxx.ts`.
   - 只在 React 函数组件或其他 Hook 中调用 Hook。
2. **依赖管理**
   - 使用 `useEffect` 时明确依赖数组，禁止空数组忽略依赖。
   - 对函数/对象依赖使用 `useCallback`、`useMemo` 固定引用。
   - 当依赖为 ref 或无需触发更新时，拆分 effect。
3. **副作用与清理**
   - 订阅/计时器等 effect 返回清理函数，确保组件卸载时释放资源。
   - 使用 `AbortController` 取消未完成的 fetch 请求。
4. **状态与派生**
   - 内部状态通过 `useState`、`useReducer` 管理；复杂逻辑优先 `useReducer`。
   - 对外暴露只读值与操作函数，保持 API 稳定。
   - 使用 `useRef` 存储跨渲染持久的可变值，避免无意义重渲染。
5. **组合 Hooks**
   - 复杂流程拆分多个小 Hook；使用组合模式提高可读性。
   - 在共享业务逻辑时，Hook 内部调用其它 Hook 并导出组合结果。
6. **测试与验证**
   - 使用 `renderHook` 测试状态变化、返回值、事件触发。
   - 模拟时间：`vi.useFakeTimers()` 控制定时器。
   - 对异步 Hook 使用 `waitFor`、`act` 保证状态稳定。
7. **文档与示例**
   - 提供 Hook 使用示例，说明输入参数、返回值、依赖注意事项。
   - 在 Storybook 或文档中演示典型场景。

## 质量校验
- ESLint React Hooks 规则零警告，TS 类型严格。
- 单元测试覆盖主要分支，确保并发渲染下行为一致。
- 对外 API 变更需要版本控制与迁移指引。

## 失败与回滚
- 依赖数组错误导致竞态：回滚最近改动，使用 `eslint-plugin-react-hooks` 指出问题。
- 内存泄漏或订阅未释放：补充清理逻辑；若无法快速修复，恢复上一稳定版本。
- Hook API 修改破坏调用方：提供兼容层或回滚，同步变更说明。

## 交付物
- Hook API 文档、示例代码。
- 单元测试与覆盖率报告。
- 变化记录（Changelog）与迁移指南（如有破坏性变更）。
