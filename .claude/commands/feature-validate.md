---
description: 验证 FRD 是否达标，并联动相关技能生成质量报告。
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*)
argument-hint: [FRD.md] [--fix-only] [--output <file>] [--strict]
---

## 参数

- **必填**：`FRD.md`（需验证的特性文档）。
- **可选**：`--fix-only`（仅输出缺陷清单）、`--output <file>`、`--strict`。
- 路径必须指向最新版本的 FRD；命令不负责修改需求范围。

## 加载技能

- `method-business-impact-engineering` ：Value Brief、指标链路、护栏指标、单位经济目标、实验设计。
- `scenario-feature-validation` ：验收标准对照、质量门执行、修复任务编号。
- `scenario-quality-gates` ：格式、静态分析、测试、依赖、构建的目标化执行。
- `method-risk-matrix` ：评估失败项风险，决定阻塞或豁免。
- `method-context-snapshot` （可选）：生成验证快照，支持长流程沟通。

## 流程概览

1. **读取标准**：解析 FRD 的验收/非功能章节与 Value Brief 中的 NSM、输入指标、护栏、单位经济目标，建立核对清单。
2. **执行质量门**：按 `scenario-quality-gates` 的顺序运行质量门，并限制在 FRD 涉及的路径，同时采集实验/灰度数据。
3. **差距分析**：对比结果与 FRD 指标、Value Brief 假设，使用 `method-risk-matrix` 评估风险等级，生成 R 编号任务。
4. **输出报告**：更新 FRD 的验证章节或写入 `--output` 文件；若 `--fix-only`，仅列出修复清单，并同步 Value Brief 状态。

## 产出

- 六块结构化输出：Value Brief 验证结论、Plan 执行状态、Metrics 达成情况、Ops 风险、Code/Config 调整、Risks/下一步。
- 验证摘要：通过项/未通过项及风险评估。
- 修复任务列表（R01/R02/...），标注 Owner、截止时间、关联技能。
- 如需交接，附上质量门命令与结果引用，便于复现。

## 异常处理

- FRD 缺失验收标准：暂停验证，要求 `scenario-feature-design` 补齐。
- 质量门不可用：记录环境依赖，必要时降级为“阻塞等待”。
- 指标与实现矛盾：与 Owner 复核后更新 FRD 或标记修复任务。
