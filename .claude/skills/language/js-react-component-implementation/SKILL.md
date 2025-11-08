---
name: js-react-component-implementation
description: 当需要把交互稿或接口契约落地成 React/TypeScript 组件，并同步完成样式、状态与测试交付时，加载本技能获取端到端实现步骤。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# React 组件实现技能

## 适用场景

- 新增 UI 组件或重写遗留实现，需要保证类型、安全性与可测试性。
- 把交互稿/原型转化为可复用组件，并与设计系统保持一致。
- 组件需要在多路由/微前端共享，必须定义清晰 API 与依赖。

## 前置准备

- 拿到交互稿、可视稿、复制文案以及接口协议（Swagger/GraphQL schema）。
- 确认技术栈（React 版本、状态库、样式方案：CSS Modules/Tailwind/Chakra）。
- 了解 lint/test 命令：`npm run lint`, `npm run test`, `npm run storybook`。
- 若组件需国际化，准备 i18n 字段表与占位符策略。

## 操作步骤

1. **契约与文件布局**
   - 在 `src/components/<ComponentName>/` 下创建 `index.ts`, `<ComponentName>.tsx`, `__tests__`, `stories.tsx`。
   - 定义 Props 接口：包含必填项、可选项、事件回调、数据结构；避免 `any`，使用 `Pick/Partial` 精准建模。
   - 为组件生成用户旅程用例（表格：输入、操作、期望渲染），作为后续测试基线。
2. **骨架搭建**
   - 先写结构化标记与语义化标签，保留 `TODO` 表示尚未确定区域。
   - 使用 `forwardRef` 和 `React.memo` 规范对外暴露的组件，保持可组合性。
3. **状态与数据处理**
   - 区分本地状态（`useState/useReducer`）与外部数据（props/store/query）。
   - 对网络请求采用自定义 Hook（`useOrderList`），封装加载/错误/重试逻辑；副作用统一放在 Hook 中，组件保持声明式。
   - 对昂贵计算使用 `useMemo`，对事件处理使用 `useCallback`，并配合依赖数组 ESLint 规则。
4. **样式与响应式**
   - 根据设计系统 token（spacing/color/typography）实现，优先复用已有组件。
   - 保证可访问性：设置 `aria-*`、键盘导航、焦点管理（`tabIndex`, `role`）。
   - 处理响应式：使用容器查询或 CSS Grid/Flex，辅以 `prefers-reduced-motion` 降级动画。
5. **测试与文档**
   - 使用 `@testing-library/react` 模拟用户行为，断言可见文本而非 DOM 结构；必要时结合 `msw` mock 网络。
   - Storybook 添加基本态、加载态、错误态；在 Docs tab 记录 props 表和交互说明。
   - Lint + type check：`npm run lint && npm run typecheck`（若无脚本则补充）。

## 质量校验

- TypeScript 无 `any` 漏网；props 文档（Storybook/MDX）与实现一致。
- 测试覆盖主要交互路径（至少加载/成功/失败），CI 通过。
- 组件体积、依赖、a11y 指标满足团队基线，且在 PR 中说明。

## 失败与回滚

- 组件实现与设计偏差：保留演示截图，先合并最小可行版本，后续补齐。
- 新样式破坏其他组件：通过视觉回归或 Storybook playwright 测试确认，再回滚样式文件。
- Hook 抽象过度导致调试困难：回退到简单实现，同时记录复现步骤与 TODO。

## 交付物

- 组件源码、测试、Storybook 文件以及示范用例。
- PR 描述中的契约说明（Props 表、事件、状态说明）。
- 变更日志或端到端验证步骤，方便 QA/PM 复测。
