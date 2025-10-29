---
description: 按 CRD 执行前端实现，串联任务分解、质量门与报告技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), Bash(*), TodoWrite
argument-hint: [CRD.md] [--strict] [--dry-run] [--output <file>]
---

# 前端实施

## 参数

- **必填**：`CRD.md`（组件/特性设计文档）。
- **可选**：`--strict`、`--dry-run`、`--output <file>`。
- 需要已通过 `/frontend-design` 的审批；缺失设计信息时应返回讨论。

## 加载技能

- `scenario-feature-execution` ：提供通用的特性实施状态机和流程。
- `scenario-frontend-execute` ：补充前端特有的实现步骤和质量门。
- `scenario-quality-gates` : 定义前端质量门的执行顺序。
- 语言与工具技能：`js-frontend-react`、`js-react-hooks`、`js-react-state-management`、`js-frontend-presentation`、
  `js-tool-prettier`、`js-tool-eslint`、`ts-tool-tsc`、`js-tool-vitest`、`js-tool-vite-bundler`。

## 流程概览

1. **解析 CRD**：加载任务分解、Props/State 契约、a11y/性能要求，并建立执行队列。
2. **按批实施**：结合语言/工具技能完成组件、Hooks、样式等实现，每个批次结束即运行对应质量门。
3. **自愈与升级**：失败时参考 `scenario-feature-execution` 的自愈规则（≤3 次）；涉及架构冲突时暂停请求决策。
4. **终态校验**：全部任务完成后再次运行 `scenario-quality-gates` 全套命令，并产出执行报告。

## 产出

- 实现变更与测试集：包括组件/Hook 源码、Story/示例、Vitest/Playwright 测试。
- 质量门记录：格式、Lint、类型、测试、构建的命令与结果。
- 回滚或特性开关策略，及后续验证/发布建议。

## 异常处理

- CRD 信息缺失：暂停执行并回流至设计阶段补充。
- 质量门无法通过：记录失败原因并自愈；超过 3 次需升级讨论。
- 性能/a11y 指标未达标：调动语言技能优化并更新 CRD 验收记录。
