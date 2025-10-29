---
name: js-tool-eslint
description: 使用 ESLint 保障 JavaScript/TypeScript 代码质量，覆盖配置分层、常见规则与技术债清理。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# ESLint 技能

## 适用场景

- 在指定目录运行 ESLint，确保无错误与无忽略。
- 配置规则、覆盖、插件，适配 React/TypeScript。
- 清理现有 lint 技术债，建立持续治理策略。

## 前置准备

- `node_modules` 已安装，对应 `eslint` 版本与插件齐全。
- 了解项目的 `.eslintrc.*` 层级（根目录、包内、CI 专用）。
- 明确目标路径，例如 `packages/ui/`、`apps/dashboard/`。

## 操作步骤

1. **命令执行**
   - `npx eslint packages/ui --ext .ts,.tsx --max-warnings=0`.
   - 对 monorepo 使用 `pnpm eslint --filter <pkg>` 或 `nx lint <proj>`。
2. **配置管理**
   - 采用共享配置（`extends`）减少重复；针对包内的例外使用 `overrides`。
   - 禁止随意添加 `eslint-disable`; 必须写明规则与理由，登记例外卡。
3. **常见规则修复**
   - `no-unused-vars`：删除未使用变量或前缀 `_`。
   - `@typescript-eslint/no-explicit-any`：引入类型或泛型。
   - `react-hooks/rules-of-hooks`：检查 Hook 调用位置与依赖数组。
   - `security/detect-object-injection`：使用 `hasOwnProperty` 或白名单。
4. **自动修复**
   - `npx eslint <path> --fix`，之后运行 Prettier 校验。
   - 每次自动修复后必须执行测试，确保无行为回归。
5. **技术债治理**
   - 统计错误数量，超过 10 个创建专项任务。
   - 以规则为维度拆分提交：先清理语法类，再处理风格或复杂规则。

## 质量校验

- 目标路径输出 `0 problems`，无 error/warning。
- 在 CI 中开启 `--max-warnings=0`，确保 warning 被视为错误。
- 补充对应测试或类型校验，验证修复未引入回归。

## 失败与回滚

- 插件冲突或版本不兼容：锁定依赖版本，研判需要升级还是降级。
- 自动修复破坏格式：运行 Prettier 重整；必要时回滚并手动处理。
- 临时禁用规则：在 `overrides` 中限定文件范围并标注清理计划。

## 交付物

- Lint 执行记录（命令、路径、输出摘要）。
- 修复策略说明：列出触及的规则与改动方式。
- 若调整配置，附带变更 diff 与验证命令。
