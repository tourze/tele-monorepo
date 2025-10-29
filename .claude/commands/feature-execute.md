---
description: 按 FRD 执行实现，统一调度相关技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), Bash(*), TodoWrite
argument-hint: [FRD.md] [--strict] [--dry-run] [--output <file>]
---

## 参数

- **必填**：`FRD.md`（特性需求文档路径）
- **可选**：`--strict`（启用严格校验）、`--dry-run`（仅生成计划）、`--output <file>`（写入报告）
- 未知旗标在严格模式下会被拒绝。

## 加载技能

- @.claude/skills/method/business-impact-engineering/SKILL.md ：Value Brief、指标链路、灰度/回滚策略、单位经济与实验护栏。
- @.claude/skills/scenario/feature-execution/SKILL.md ：解析 FRD、分配任务、执行状态机流程。
- @.claude/skills/scenario/quality-gates/SKILL.md ：按目标路径运行格式、静态分析、测试、构建等质量门。
- @.claude/skills/method/context-snapshot/SKILL.md （可选）：在长流程中生成会话快照，保持上下文可追溯。

## 流程概览

1. **商业对齐**：读取 Value Brief、指标链路、灰度计划，确认假设、护栏与单位经济目标。
2. **解析输入**：读取 FRD，按技能 `scenario/feature-execution` 的状态机生成任务队列；严格模式下拒绝缺失章节。
3. **预检架构**：比对任务对现有系统的影响，如检测到风险，触发讨论模式（可结合 `method/stakeholder-communication`）。
4. **逐项执行**：对每个任务应用必要的语言/工具技能（例如 PHP 相关修改加载相应 tool/language 技能），并在完成后立即调用质量门技能。
5. **自愈与升级**：质量门失败时，依照 `scenario/feature-execution` 的自愈策略重试 ≤3 次；无法修复时记录阻塞并请求决策。
6. **汇总结论**：生成执行报告，可用 `--output` 写入文件；如流程较长，结合 `method/context-snapshot` 输出快照，并回填 Value Brief 状态。

## 产出

- 六块结构化输出：Value Brief 更新、Plan 执行进度、Metrics 触达情况、Ops 风险、Code/Config 变更、Risks/下一步决策。
- 任务执行结果与质量门清单（见 `scenario/quality-gates` 的验证模板）。
- 阻塞与返工项的负责人、风险与后续动作。
- 生成的补丁/提交信息草案，需包含验证命令。

## 异常处理

- 缺失 FRD 章节或任务：暂停并列出缺口，需业务方补齐。
- 架构冲突：使用 `method/stakeholder-communication` 发起澄清，记录决策。
- 质量门持续失败：升级为阻塞，参考 `scenario/feature-validation` 制定修复计划。
