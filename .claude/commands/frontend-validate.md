---
description: 按 CRD 验证前端组件/特性，生成质量报告与修复清单。
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*)
argument-hint: [CRD.md] [--fix-only] [--output <file>] [--strict]
---

## 参数

- **必填**：`CRD.md`（需验证的组件/特性设计）。
- **可选**：`--fix-only`（仅输出修复任务）、`--output <file>`、`--strict`。
- 验证前需确认 CRD 的质量验收标准已完整。

## 加载技能

- @.claude/skills/scenario/feature-validation/SKILL.md : 提供通用的差距分析、风险评估和报告流程。
- @.claude/skills/scenario/frontend-validate/SKILL.md : 补充前端特有的验证维度，如性能和浏览器兼容性。
- @.claude/skills/scenario/quality-gates/SKILL.md : 执行前端质量门。
- @.claude/skills/method/risk-matrix/SKILL.md : 用于评估失败项的风险等级。

## 流程概览

1. **对齐标准**：解析 CRD 的质量验收标准、任务分解、监控需求，构建核对清单。
2. **执行质量门**：通过 `scenario/quality-gates` 对目标路径运行格式、Lint、类型、测试、构建命令；记录命令与结果。
3. **差距分析**：比较质量门结果与验收标准，使用 `scenario/feature-validation` 生成 R 编号任务，并以 `method/risk-matrix` 评估风险。
4. **输出报告**：更新 CRD 验证区块或写入 `--output` 文件；`--fix-only` 时仅输出任务清单与责任人。

## 产出

- 验证摘要：通过项、未通过项、风险级别、下一步建议。
- 修复任务列表（R01/R02/...），含路径、原因、所需技能与目标质量门。
- 质量门命令与执行结果引用，方便复现与发布前复核。

## 异常处理

- CRD 缺失验收标准：暂停验证，回流设计补齐。
- 环境或依赖不可用：记录限制与待办，避免给出误导结论。
- 验证结果与实现矛盾：与实现 Owner 复盘，必要时同步更新 CRD 或创建修复任务。
