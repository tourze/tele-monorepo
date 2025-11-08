---
name: react-component-analysis
description: 在梳理或评审 React 组件时用于拆解职责、数据流、渲染路径与依赖，帮助定位重复渲染、props 泄漏或副作用问题。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# React 组件分析技能

## 适用场景

- 组件职责模糊、逻辑重复或难以维护，需要重新定位边界。
- 页面存在渲染卡顿、状态不同步、props 传递链过长等异常。
- 评审新组件/PR，希望验证数据流、Hook 使用与依赖是否合理。

## 前置准备

- 收集合并后的组件树（路由/Storybook/设计稿）与交互说明。
- 获取状态来源（store、context、URL 参数）以及关键接口响应样例。
- 准备 React DevTools、`why-did-you-render` 或性能日志，便于对照。

## 操作步骤

1. **绘制组件责任图**
   - 用 Mermaid 或表格列出“容器/展示/跨切”组件及其入口。
   - 标注每个组件的输入（props、context、外部服务）与输出（事件、导航、数据写入）。
2. **状态与数据流审计**
   - 逐项列出 `useState/useReducer`、自定义 Hook、store slice，确认来源、更新者、消费者。
   - 检查派生状态是否可通过 memo/selector 计算，减少重复存储。
3. **副作用与依赖核对**
   - 枚举 `useEffect/useLayoutEffect`，核实依赖数组完整性，避免隐式依赖。
   - 对比接口调用与加载状态，确认取消/重试策略，必要时补充 `AbortController`。
4. **渲染路径分析**
   - 使用 React DevTools Profiler 或 `why-did-you-render` 记录交互场景，定位高频重复渲染节点。
   - 检查 `key`、`memo`、`useMemo/useCallback` 使用是否正确，避免闭包持有旧值。
5. **契约校验**
   - 对照 TypeScript 类型/PropTypes，确保 props 有文档、有默认值/非空策略。
   - 核实测试用例是否覆盖边界（空数据、慢接口、交互失败）。

## 质量校验

- 组件职责清晰，没有跨层读写 state 或长链 props 钻透。
- 所有副作用依赖可解释，关键路径渲染次数在指标阈值内（例如交互 < 50ms）。
- 产出分析文档或注释，供团队在 PR/设计评审时复用。

## 失败与回滚

- 分析解耦导致需求落地受阻：保留原组件实现，先记录风险与后续重构计划。
- 引入调试工具拖慢环境：通过环境变量控制加载或在生产构建禁用。
- 对依赖数组的改动使逻辑破坏：立即恢复旧实现并补充测试覆盖。

## 交付物

- 组件责任/数据流图（Mermaid 或表格）以及问题清单。
- 针对高风险组件的渲染测量记录与优化建议。
- 更新后的测试计划或 Bug 追踪链接，确保问题闭环。
