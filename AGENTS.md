# AGENTS.md

## 项目上下文
- **工作空间**：Nx monorepo (v18+), npm 包管理
- **子项目**：
  - **seven-fish-customer-service**：React 16.8.0, Webpack 2.4.1, Less/CSS, React Router DOM 5.2.0, weixin-js-sdk
  - **utc-react**：React 17.0.2, UmiJS Max 4.1.1, Ant Design 5.13.2, TypeScript 5.3.3 (严格模式), Less modules, Handsontable/FortuneSheet
- **目录结构**：
  - 源代码：`apps/<project>/client` (seven-fish), `apps/utc-react/src` (utc-react)
  - OpenSpec：`openspec/project.md`, `openspec/AGENTS.md`, `openspec/changes`
- **API 模式**：JSON-RPC, Bearer Token 认证 (cookies), 统一调用 `callAPI` (utc-react) 或 fetch/axios (seven-fish)

## 代码风格
- **TypeScript (utc-react)**：
  - 严格模式 (`tsconfig.json: "strict": true`)
  - 单引号，无分号
  - 函数式组件 + Hooks，禁用 `any`
  - 路径别名：`@/*`, `@@/*`
  - 文件 ≤500 行，函数 ≤100 行，圈复杂度 ≤10
- **React (通用)**：
  - 函数式组件，PascalCase 命名
  - Props 接口：`ComponentNameProps`
  - 自定义 Hooks：`use*`
- **样式**：
  - utc-react：Less modules (`styles.module.less`), antd-style
  - seven-fish：传统 CSS/Less
- **安全**：
  - 输入校验：zod (TS)
  - 模板输出：自动转义
  - 权限：Bearer Token, 最小权限原则

## RCCA 提示词模板
- **Role**：10 年经验的 TypeScript/React 工程师，熟悉 Nx 和 UmiJS
- **Context**：任务位于 apps/<project>, 技术栈 React/UmiJS
- **Constraint**：单引号，无分号，zod 校验，函数式组件
- **Action**：生成指定功能的代码