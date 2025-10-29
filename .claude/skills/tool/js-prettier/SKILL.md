---
name: js-tool-prettier
description: 使用 Prettier 统一 JS/TS/React 代码格式，处理配置、冲突。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Prettier 格式化技能

## 适用场景

- 对指定目录执行格式化检查或自动修复。
- 解决与 ESLint 的冲突，确保格式规则一致。
- 在 CI 中集成格式化校验。

## 前置准备

- 确认 `prettier` 版本与 `.prettierrc.*` 设置。
- 安装 `eslint-config-prettier` / `eslint-plugin-prettier`（如需结合 ESLint）。
- 准备 `pnpm`/`npm` 脚本，如 `"lint:format": "prettier --check ."`。

## 操作步骤

1. **检查与修复**
   - 检查：`npx prettier "packages/ui/**/*.{ts,tsx,js,jsx,json,md}" --check`。
   - 修复：`npx prettier ... --write`，随后运行 ESLint 确认无冲突。
2. **配置要点**
   - 与团队对齐核心选项：`printWidth`、`tabWidth`、`singleQuote`、`trailingComma`。
   - 使用 `.prettierignore` 排除构建产物、依赖、生成文件。
   - 若需按文件类型定制，使用 `overrides`。
3. **与 ESLint 协同**
   - 确保 ESLint 最终 extends 包含 `prettier`，取消格式相关规则。
   - 可选择在 ESLint 中启用 `prettier` 插件，使格式错误表现为 lint error。
4. **CI 集成**
   - 在质量门中添加 `pnpm lint:format`，并限制目标路径。
   - 对提交前钩子（Husky）运行 `prettier --check`，放在 lint 前。
5. **排障**
   - 若格式化结果不一致，检查编辑器插件是否使用本地配置。
   - 出现性能问题时，可通过 `--loglevel debug` 观察处理文件数量。

## 质量校验

- `prettier --check` 无差异。
- 与 ESLint、tsc、Vitest 同步运行证明无冲突。
- 对格式化后的关键文件运行测试，确保未误改逻辑代码。

## 失败与回滚

- 格式化引入大量 diff：先用 `git diff --stat` 评估范围，按目录拆分执行，并配合 `git add -p` 控制提交。
- 需要临时跳过文件：添加到 `.prettierignore` 并记录清理计划。
- 配置调整效果不佳：还原 `.prettierrc`，重新征求团队共识。

## 交付物

- 格式化命令与目标路径列表。
- 配置变更说明与团队同步记录。
- 若设置了钩子或 CI 步骤，附上脚本片段。
