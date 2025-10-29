---
description: 审阅并改进设计文档，按技能循环识别问题、讨论决策、落实修改。
allowed-tools: Read(*), Write(*), Edit(*), Glob(*)
argument-hint: [path/to/design-doc.md] [--output <file>] [--strict]
---

## 参数

- **必填**：设计文档路径（FRD/CRD/DESIGN.md 等）。
- **可选**：`--output <file>`（输出评审纪要）、`--strict`（严格校验未知旗标）。
- 评审聚焦逻辑设计层，禁止引入数据库迁移等实现细节。

## 加载技能

- `scenario-design-review` ：IDEC 循环、问题清单、决策记录与文档更新。
- `method-stakeholder-communication` ：对话节奏、澄清问题、记录干系人反馈。
- `method-risk-matrix` ：风险识别、优先级排序、缓解策略。
- `scenario-feature-design` （可选）：确保设计输出与 FRD 模板一致。

## 流程概览

1. **读取与梳理**：按照 `scenario-design-review` 的 IDEC 流程解析文档，构建按风险排序的问题清单。
2. **讨论与决策**：借助 `method-stakeholder-communication` 发起结构化讨论，使用 T-R-O-V/TODO 列表锁定决策。
3. **执行修改**：在得到确认后，依据清单更新文档；必要时回溯到相关技能（如 `scenario-prd-visual-optimizer` ）处理可视化。
4. **复核与记录**：完成一轮问题后重新扫描，直到清单为空。输出总结与后续行动，必要时写入 `--output` 文件。

## 产出

- 评审日志：问题、决策、行动项（详见 `scenario-design-review` ）。
- 更新后的设计文档及渲染校验结果。
- 后续任务清单，标注 Owner、截止时间、所需技能。

## 异常处理

- 资料缺失或冲突：记录并请求补充，暂停相关问题的讨论。
- 争议未决：标注升级路径，结合 `method-risk-matrix` 的风险级别决定是否阻塞。
- 修改破坏一致性：回滚至上一个稳定版本，再按照技能流程依次修正。
