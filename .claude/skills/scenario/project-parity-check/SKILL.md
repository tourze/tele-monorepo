---
name: scenario-project-parity-check
description: 当需要对齐跨项目/跨语言实现，确保接口、业务行为和质量门保持一致时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# 项目对齐核查技能

## 适用场景

- Symfony ↔ Django、旧版 ↔ 新版等跨实现的接口、用例、数据结构需要逐项比对。
- 同一业务在多个项目/渠道上线，要求功能、配置、监控一致。
- 批量重构或迁移后，需要确认新实现与参考实现（Baseline）保持等价。

## 前置准备

- 明确参考实现（Baseline）的 Git 分支/提交哈希、接口清单、测试结果，并确认其状态可信。
- 获取目标实现的路径、负责人、上线窗口、灰度/回滚约束及例外卡。
- 与干系人确认对齐范围：业务域、接口列表、配置/数据口径、监控指标、质量门。
- 准备比较工具：diff 脚本、合同测试框架、环境访问权限、日志收集方式。

## 质量校验

- 形成对齐矩阵：包含接口/用例、现状、差异、处理结论、验证证据。
- 所有差异要么修复、要么登记为例外并附风险评估。
- 目标实现完成并通过各项质量门（静态分析、测试、性能、观测）。
- 回滚与灰度计划具备可执行脚本或命令，经演练验证。

## 操作步骤

1. **设定基线**
   - 调用 `/git-history` 或 `method-git-forensics` 获取 Baseline 关键提交。
   - 核对版本差异：接口签名、实体结构、配置文件、依赖清单。
   - 若 Baseline 未通过质量门，先记录风险并确认是否需要同步修复。
2. **梳理对齐对象**
   - 汇总“接口/流程一览表”，字段包括：`模块`、`端点/用例`、`Baseline 文件`、`目标文件`、`当前状态`。
   - 可使用 `diff --stat`、`symfony console debug:*`、`python manage.py showmigrations` 等命令构建差异快照。
   - 对于大规模目录，建议脚本化生成对比报告（如 `git diff --name-status <baseline>...<target>`）。
3. **验证差异**
   - 分类处理：协议/路由、领域逻辑、数据模型、鉴权与观测。
   - 对每个差异写明处理动作（修复/保留/待决），附责任人和截止时间。
   - 关键逻辑需补充自动化测试；引用 `scenario-quality-gates` 执行质量门。
4. **业务与技术验证**
   - 编写并运行对齐测试脚本（可选：合同测试、接口回放、截图对比）。
   - 若涉及配置/基础设施，记录对应 `terraform`/`ansible`/`helm` 差异。
   - 监控与告警对齐：确保 NSM/护栏指标在两个项目中均可观测。
5. **灰度与回滚**
   - 设计验收步骤：先对齐测试环境→预生产→生产灰度。
   - 明确回滚触发条件：功能异常、指标越界、质量门失败。
   - 回滚方案需脚本化（如 `git revert`、特性开关、流量切换）。
6. **输出报告**
   - 产出《Parity Check 报告》：摘要、对齐矩阵、验证记录、风险与后续行动。
   - 在 `.claude/memories` 或项目文档库登记运行记录，便于后续追踪。

## 工具与命令建议

- `git diff --name-only <baseline>...<target>`：快速识别变更文件范围。
- `symfony console debug:router`、`php bin/console doctrine:mapping:info`：核对路由与实体。
- `python manage.py show_urls`、`django-admin check`：对齐 Django 端点与健康状况。
- 合同测试/接口对比工具：`pact`, `schemathesis`, `curl`+`jq` 脚本。
- 质量门：复用 `/fix-code`、`/quality-batch`（若已有）、`scenario-quality-gates`。

## 交付物

- 对齐矩阵（推荐格式 `.md` 表格或 `.csv`）。
- 验证命令与日志归档（`/logs/YYYYMMDD-<project>-parity/*.log`）。
- 风险清单与例外卡链接。
- 灰度计划、回滚脚本或命令草案。

## 失败与回滚

- 遇到 Baseline 不可信或对齐目标缺失质量门时，暂停对齐流程，优先恢复基线或补齐质量门；必要时登记风险。
- 对齐过程中发现关键接口不等价，应回滚当前改动，先校准差异再继续执行；保留失败日志与 diff 供复核。
- 依赖、环境或配置差异导致验证失败时，拆分任务与环境，恢复至已验证的快照，协调 SRE/平台团队处理后再继续。
- 发布阶段若灰度指标异常，启用已准备的回滚脚本或流量切换方案，记录触发条件与执行日志。

## 复盘要求

- 完成后调用 `scenario-engineering-retro` 或 `method-retro-memory` 记录经验。
- 更新相关命令/技能（如 `/quality-batch`、`/service-parity-check`）以沉淀复用资产。
- 将成功案例纳入团队知识库，作为后续对齐行动的基准模板。
