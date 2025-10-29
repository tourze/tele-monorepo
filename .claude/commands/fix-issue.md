---
description: 修复指定 Issue，串联复现、实现、验证、报告的技能。
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*)
argument-hint: <issue-id|url> [--path <dir>] [--strict] [--dry-run] [--output <file>]
---

# Issue 修复

## 参数

- 必填：`<issue-id|url>`（GitHub/平台 Issue 标识）
- 可选：`--path <dir>`（限定目录）、`--strict`、`--dry-run`、`--output <file>`
- 建议将 `--path` 精确到受影响模块，避免全仓扫描。

## 加载技能

- `scenario-bugfix-root-cause` ：复现、根因分析、失败测试编写。
- `scenario-feature-execution` ：任务分解、实施流程、提交策略。
- `scenario-feature-validation` ：修复后的质量门验证与报告。
- `scenario-quality-gates` ：目标化质量门执行。
- `method-context-snapshot` （可选）：用于记录阶段快照与审计摘要。

## 流程概览

1. **解析 Issue**：读取描述、验收条件、复现步骤；不足时触发讨论（参 `method-stakeholder-communication` ）。
2. **复现与定位**：依据 `scenario-bugfix-root-cause` ，编写失败测试或命令重现问题，锁定根因。
3. **设计与实施**：参考 `scenario-feature-execution` 制定修复计划，按语言/工具技能执行代码修改。
4. **验证与回归**：使用 `scenario-quality-gates` 和 `scenario-feature-validation` 运行质量门，确认新测试通过且无回归。
5. **报告与提交**：汇总根因、修改点、验证证据，生成 `Fixes #<id>` 提交说明；`--output` 可导出报告。

## 产出

- 修复报告：根因分析、代码变更摘要、质量门结果、回滚策略。
- 新增或更新的回归测试（必须先红后绿）。
- 提交信息草案，符合语义化规范并关联 Issue。

## 异常处理

- 无法复现：暂停进入 `A待澄清`，记录已尝试步骤并请求补充信息。
- 验证失败：按 `scenario-feature-validation` 分类修复；若跨模块风险上升，升级沟通。
- 需求变更：确认 Issue 是否需关闭并转为变更请求记录。
