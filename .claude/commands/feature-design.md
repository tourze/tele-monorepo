---
description: 创建或推进 FRD，统一调度相关技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), TodoWrite
argument-hint: [FRD.md|name keywords] [--output <file>] [--strict]
---

## 参数

- **必填**：`FRD.md` 路径或关键词（唯一定位/新建 FRD）
- **可选**：`--output <file>`（输出结果）、`--strict`（严格校验）
- 设计阶段禁止引入数据库迁移或基础设施改动。

## 加载技能

- @.claude/skills/method/business-impact-engineering/SKILL.md ：Value Brief、指标链路、优先级评分、灰度与回滚方案。
- @.claude/skills/scenario/feature-design/SKILL.md ：FRD 结构、阶段推进、权限矩阵与风险分析。
- @.claude/skills/scenario/prd-visual-optimizer/SKILL.md ：双轨呈现（Mermaid + 表格）与渲染校验。
- @.claude/skills/scenario/pm-tech-manager-assistant/SKILL.md ：6D 生命周期、Mermaid 甘特图、沟通矩阵。
- @.claude/skills/scenario/ratecard-quote/SKILL.md （如需估算）：生命周期报价结构与 Rate Card 使用。
- @.claude/skills/method/stakeholder-communication/SKILL.md （可选）：审批、澄清与记录。

## 流程概览

- **商业价值对齐**：先调用 `method-business-impact-engineering`，输出迷你 PR/FAQ、Value Brief、指标链路、RICE/WSJF 评分、MVP/灰度计划。
- **阶段推进**：按照 `scenario/feature-design` 的模板补齐目标、范围、架构决策、任务分解、质量指标，并确保与 Value Brief 一致。
- **可视化**：借助 `scenario/prd-visual-optimizer` 生成流程图、架构图、权限矩阵等，并校验渲染兼容。
- **资源与计划**：当涉及成本/排期时，使用 `scenario/pm-tech-manager-assistant` 与 `scenario/ratecard-quote` 的方法论输出甘特图和报价表。
- **协作沟通**：通过 `method/stakeholder-communication` 与干系人确认需求、记录审批节点。

## 产出

- 六块结构化输出：Value Brief、Plan、Metrics、Ops、Code/Config、Risks。
- 结构完整、可执行的 FRD（含双轨呈现、权限矩阵、风险与验收）。
- 进度摘要或审批记录，必要时写入 `--output` 指定文件。
- 后续建议：进入实施前的准备事项与质量预检结论。

## 异常处理

- 需求信息缺失：记录问题清单与责任人，待确认前暂停推进。
- 发现迁移/基础设施请求：标注越界部分并建议移交相关团队。
- 渲染失败或表格不一致：按照 `scenario/prd-visual-optimizer` 的校验步骤修正后再提交。
