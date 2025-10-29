---
description: 创建或推进 CRD，调度前端设计相关技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), TodoWrite
argument-hint: [CRD.md|name keywords] [--output <file>] [--strict]
---

## 参数

- **必填**：`CRD.md` 路径或关键词（定位/新建 CRD）。
- **可选**：`--output <file>`、`--strict`。
- 设计阶段聚焦组件/页面逻辑，禁止提前安排实现层细节（如 API 签名尚未确认时）。

## 加载技能

- @.claude/skills/scenario/feature-design/SKILL.md : 提供通用的 FRD 设计流程与结构。
- @.claude/skills/scenario/frontend-design/SKILL.md : 补充前端特有的 CRD 设计要点，如组件树和状态管理。
- @.claude/skills/language/js-frontend-react/SKILL.md 、 @.claude/skills/language/js-react-state-management/SKILL.md : 提供组件结构、状态分层等具体实现指导。
- @.claude/skills/language/js-frontend-presentation/SKILL.md : 关注设计系统、a11y 与视觉表现。
- @.claude/skills/scenario/prd-visual-optimizer/SKILL.md : 用于保证图表与表格的一致性。

## 流程概览

1. **定位与建模**：按照 `scenario/frontend-delivery` 的设计阶段要求，创建/定位 CRD，并确认组件的角色、数据流、交互范围。
2. **填充模板**：使用 `scenario/prd-visual-optimizer` 保证 CRD 中的流程图、组件树、表格双轨一致；状态管理、数据契约部分引用语言技能。
3. **校验与审批**：每个阶段完成后生成进度摘要，直接记录审批要点；确保 a11y、性能、状态最小化约束得到记录。
4. **输出整理**：在 `--output` 指定时汇总阶段结论，提示后续 `/frontend-execute` 与 `/frontend-validate` 所需准备。

## 产出

- 完整的 CRD：用户价值、数据/状态契约、交互流程、可访问性、性能要求、任务分解、验收标准。
- 可视化资源：Mermaid 组件树/流程图、表格与图一致性校验结果。
- 阶段审批记录及后续推荐动作。

## 异常处理

- 信息缺失：记录问题清单并请求补充，暂停推进。
- 渲染失败或结构不一致：按 `scenario/prd-visual-optimizer` 重新校验后再提交。
- 设计与既有实现冲突：使用 `method/stakeholder-communication` 协调，必要时创建重构任务。
