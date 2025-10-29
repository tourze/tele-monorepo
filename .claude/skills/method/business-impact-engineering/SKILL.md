---
name: method-business-impact-engineering
description: 当需要在工程任务中对齐商业目标、指标、成本与实验策略，并产出 Value Brief 与灰度护栏时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# 商业价值导向工程技能

## 适用场景

- 规划或开发新功能、API、数据管道、运维脚本，需说明商业影响时。
- 设计实验、埋点、性能或成本优化方案，希望量化 ROI 与验证路径时。
- 在交付前评估“速度 vs 稳定性 vs 成本”权衡，或决定是否放量、回滚时。
- 轻量任务（文档微调、单文件格式化、拼写修复等低风险改动）需要快速确认商业影响最小化时，可调用本技能的简化流程。

## 轻量任务判定与快捷流程

1. 确认是否满足以下全部条件：  
   - 改动仅涉及单一文件或单一目录，且无跨模块依赖。  
   - 不影响功能行为、业务规则、数据结构或上线窗口。  
   - 风险等级为低，未触及安全、合规、性能、成本红线。
2. 若全部满足，在回复中完成“三句价值校验”：  
   - **改动目的**：一句话说明此次改动为哪类轻量任务。  
   - **影响范围**：确认影响仅限指定文件或目录，无外部依赖。  
   - **成功判据**：定义变更完成后如何验证（如文档表述一致、Lint 通过等）。
3. 校验通过即可进入简化流程，仅需记录上述三句与风险确认；任何一项不满足或存在不确定性，立即回到完整流程执行标准交付物。

## 工作准则

1. **结果优先**：先写商业目标、北极星指标（NSM）与≤3 个输入指标，确保可验证且可证伪。
2. **倒推法**：用 5 句“迷你 PR/FAQ”说明客户是谁、痛点与现在动手的理由，以及成功/失败如何被指标证明。
3. **最短学习周期**：默认提出 MVP、特性开关、渐进放量与 Kill Switch，缩短 Build–Measure–Learn。
4. **单位经济**：估算方案对关键单位成本（如每次下单、每千请求成本）的变化，并说明数据来源或假设。
5. **可靠性权衡**：评估 SLO 与误差预算消耗，预算不足时建议暂停上新或调整范围。
6. **实验可信度**：提出 OEC（Overall Evaluation Criterion）、护栏指标、样本量、最小可检测效应（MDE）、早停与多版本控制策略。
7. **性能即现金**：设定目标时延/体积，并说明其对转化、留存或收入的影响与监控计划。

## 前置准备

- 收集业务目标、北极星指标，以及当前关注的 1–3 个输入指标与基线数据。
- 获取目标用户与场景（JTBD）、关键约束（合规/风控/预算/上线窗口）。
- 了解现有技术栈、数据口径、监控能力与误差预算使用情况。

## 所需输入（缺失时必须追问）

- 业务目标、北极星指标，以及本次关注的 1–3 个输入指标与当前基线。
- 目标用户与场景（JTBD）、关键约束（合规/风控/预算/上线窗口）。
- 当前技术栈、数据口径、监控能力、误差预算使用情况。

## 质量校验

- 交付 Value Brief（≤8 句），清晰描述客户价值、商业指标、单位经济影响与关键假设。
- 提供优先级框架（RICE 或 WSJF）评分及数据来源，说明排序理由。
- 设计 MVP、开关、灰度放量节奏、回滚条件与判定标准。
- 明确 NSM、输入指标、护栏指标、埋点/监控方案及实验设计。
- 说明 SLO 占用、变更风险、缓解措施，并给出关键代码/配置片段。
- 列出风险、假设验证方式、下一步决策点与观察项。

## 操作步骤

> 若已完成“轻量任务判定与快捷流程”的三句价值校验，可将下列步骤压缩为结论摘要与风险确认；否则请逐项交付完整内容。

1. **迷你 PR/FAQ**
   - 客户是谁？在完成什么“工作”（JTBD）？
   - 当前痛点或未满足需求是什么？
   - 为什么现在动手（竞争/窗口/预算/误差预算）？
   - 成功的指标证据是什么？失败意味着什么？
2. **指标链路**
   - 绘制 AARRR 或指标树，标出本次影响环节。
   - 绑定 NSM、输入指标与护栏指标，写清口径、采集渠道、刷新频率。
3. **优先级评分**
   - 选择 RICE 或 WSJF：列出 Reach / Impact / Confidence / Effort 或 CoD / Job Size。
   - 数值引用数据来源（历史实验、监控、访谈、财务测算）。
4. **方案设计**
   - 描述 MVP 功能范围、开关策略、灰度放量计划（示例 1%→10%→25%→50%→100%）。
   - 标注 Kill Switch、回滚判定条件、所需 Runbook。
   - 估算性能与单位经济目标：如 TTFB < 200ms、Cost per Checkout 降 15%。
5. **实验与监测**
   - 明确 OEC、护栏、MDE、样本量计算方法（可引用公式或现成工具）。
   - 设计埋点：事件、属性、ID 体系，避免口径冲突，指出监控看板需求。
   - 说明可观测性增强（trace/span 标签、日志掩码）。
6. **风险与行动**
   - 用风险矩阵评估概率与影响，列出缓解策略与 Owner。
   - 记录假设与验证计划（A/B、可观测数据、访谈），标注下一次决策节点。
7. **交付物整理**
   - 输出 Value Brief、Plan、Metrics、Ops、Code/Config、Risks 六块内容。
   - 更新相关文档、Runbook、回滚脚本与质量门记录。
   - 完成上述交付后，如未命中全局阻塞条件，立即衔接当前任务的后续动作并执行首个验证步骤，禁止等待额外确认。

## 交付物

- Value Brief：浓缩客户价值、商业指标、关键假设的八句摘要。
- 指标链路图、优先级评分表以及实验设计文档。
- MVP 范围说明、灰度与回滚计划、Kill Switch 清单。
- 监控看板或埋点变更记录、SLO 与误差预算评估结果。
- 风险矩阵、缓解方案与下一步行动项。

## 失败与回滚

- 若关键指标定义不清或数据口径存在歧义，必须停止方案评审，优先补齐指标定义并更新风险登记。
- 当护栏指标（错误率、成本、性能等）触发阈值时，按照预设 Kill Switch 立即切回安全配置，恢复原有版本。
- 实验结果若出现统计不显著或与假设相反，应按照预定义流程进入复盘：调用 `scenario/engineering-retro`，评估假设、样本量与数据质量，必要时重置实验或调整方案。
- 对于上线后出现的非预期成本或性能回退，立即执行回滚 Runbook，并在滚回后分析误差预算消耗，再决定重新放量。

## 验证与风险预案

- 在方案设计阶段，必须确保所有关键指标与数据口径都清晰无歧义。若发现模糊之处，应将其标记为高优先级风险，并规划相应的澄清步骤。
- 方案应包含对实验结果的预判。如果结果不显著或与核心假设相悖，应启动预定义的复盘与调整流程（例如，调用 `scenario/engineering-retro`）。

## 配套模板

- Value Brief 模板：`templates/value-brief-template.md`
- 指标链路检查清单：`templates/metrics-checklist.md`
- 特性开关灰度表：`templates/feature-flag-rollout.md`
- 实验设计简表：`templates/experiment-plan.md`
- 阅读清单：详见 `reference.md`（内含本技能专用的 `.claude/skills/method/business-impact-engineering/docs/business-impact-reading.md` 报告与外部链接）

## 参考资料

- Outcomes over Outputs（LeadDev）
- Working Backwards PR/FAQ（Amazon）
- Lean Startup：Build–Measure–Learn
- DORA 四键指标
- WSJF / Cost of Delay
- North Star Metric（Amplitude）
- AARRR Pirate Metrics
- RICE 优先级（Intercom）
- Jobs To Be Done（Christensen Institute）
- Impact Mapping（Gojko Adzic）
- Feature Flags / Progressive Delivery（LaunchDarkly）
- Trustworthy Online Controlled Experiments（Kohavi 等）
- Google SRE：SLO 与误差预算
- FinOps：云成本与单位经济
- Milliseconds make Millions（web.dev）

> 若需更多背景，请阅读 `reference.md` 或运行 `python .claude/skill_preview.py` 获取技能总览。
