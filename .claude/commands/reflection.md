---
description: 工程会话复盘与协作优化分析。
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*), Grep(*)
argument-hint: [session-scope] [--output <file>] [--focus <aspect>]
---

# 工程会话复盘与协作优化分析

## 参数

- **范围**：`[session-scope]`（可为空，默认当前会话；支持路径或模块关键字）。
- **可选**：`--focus <aspect>`（如 quality/collab/system/debt）、`--output <file>`（写入报告）。
- 严格模式下拒绝未知旗标；范围不明确需先澄清。

## 加载技能

- @.claude/skills/scenario/engineering-retro/SKILL.md ：端到端复盘流程、结构化报告模板。
- @.claude/skills/method/retro-memory/SKILL.md ：提炼经验、记录知识卡与改进项。
- @.claude/skills/method/context-snapshot/SKILL.md ：获取当前会话快照，保持事实准确。
- @.claude/skills/method/risk-matrix/SKILL.md ：对发现的问题进行风险评级。
- @.claude/skills/method/stakeholder-communication/SKILL.md （可选）：输出面向干系人的沟通记录与后续计划。

## 流程概览

1. **收集素材**：读取会话日志、质量门结果、提交记录；必要时调用 `method-context-snapshot` 快速回顾。
2. **归纳洞察**：依照 `scenario-engineering-retro`，整理目标、完成度、阻塞项、成功模式与问题根因。
3. **评估风险**：使用 `method-risk-matrix` 对问题分级，明确影响与缓解策略。
4. **产出行动**：利用 `method-retro-memory` 生成改进行动、知识沉淀建议、观察项；可根据 `--focus` 调整重点。
5. **交付报告**：打印 Markdown 报告，或写入 `--output` 文件；报告结构遵循工程复盘模板（核心洞察→模式→协作→行动）。

## 产出

- 工程复盘报告：核心洞察、根因、模式、协作亮点、行动计划。
- 行动清单：即刻执行、待观察、建议推广、需要决策的事项。
- 如需沉淀知识，附带建议更新的命令或技能路径。

## 异常处理

- 会话信息不足：提示用户提供补充资料或收集范围。
- 无明显问题：仍需总结正向模式与待观察项，避免报告空洞。
- 发现高风险事项：立即标记为阻塞并建议升级沟通。
