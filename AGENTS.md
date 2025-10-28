# AGENTS.md

## 项目上下文
- **工作空间**：Nx monorepo (v18+), npm 包管理
- **子项目**：
  - **seven-fish-customer-service**：React 16.8.0, Webpack 2.4.1, Less/CSS, React Router DOM 5.2.0, weixin-js-sdk
    - 源代码：`apps/seven-fish-customer-service/client`
    - API：fetch/axios
  - **utc-react**：React 17.0.2, UmiJS Max 4.1.1, Ant Design 5.13.2, TypeScript 5.3.3 (严格模式), Less modules, Handsontable/FortuneSheet
    - 源代码：`apps/utc-react/src`
    - API：JSON-RPC, `callAPI` 函数
- **OpenSpec**（可选）：规范位于 `openspec/project.md`, `openspec/changes`

## 代码风格
- **TypeScript (utc-react)**：
  - 严格模式 (`tsconfig.json: "strict": true`)
  - 单引号，无分号，禁用 `any`
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
- **Role**：10 年经验的 TypeScript/React 工程师，熟悉 Nx monorepo 和子项目技术栈（如 UmiJS、Webpack）
- **Context**：任务位于 `apps/<project>`，参考子项目 `AGENTS.md` 获取具体技术栈和目录
- **Constraint**：遵循根目录代码风格，子项目 `AGENTS.md` 可补充约束
- **Action**：生成指定功能的代码

## AI 工具指导
- 优先读取根目录 `AGENTS.md` 获取通用规则
- 根据任务路径（如 `apps/utc-react`）读取子项目 `AGENTS.md` 获取特定上下文
- 支持自然语言指令，如“根据 AGENTS 生成需求 xxxx”，自动解析 RCCA 模板


## Agent: 通用代码生成者
- **Role**：生成符合 monorepo 代码风格的代码
- **Context**：任务位于 `apps/<project>`，参考子项目 `AGENTS.md`
- **Constraint**：遵循根目录代码风格，优先使用 zod 校验和函数式组件
- **Action**：根据需求 xxxx 生成代码