---
description: 规划并执行前端重构，结合质量门与性能/a11y 守护技能。
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*), Grep(*)
argument-hint: [CRD.md|path] [--scope <glob>] [--output <file>] [--strict]
---

## 参数

- 位置参数：`[CRD.md|path]`（以 CRD 为准；否则以目录路由规则）
- 可选：`--scope <glob>`（限定文件集合）、`--output <file>`、`--strict`
- 变更范围必须可追溯至 CRD 或明确目录，禁止全仓扫描。

## 加载技能

- `scenario-frontend-execute` ：重构阶段策略、性能/a11y 校验、回归计划。
- `method-data-structure-first` ：拆分组件、提取纯函数、降低圈复杂度。
- `method-nplus1-guardian` ：识别与消除前端 N+1 请求和重复渲染。
- `method-security-baseline` ：输出转义、敏感数据处理守护。
- 语言/工具技能：React 状态管理、呈现层、TS 类型、Prettier/ESLint/Vitest/Vite.

## 流程概览

1. **范围扫描**：读取 CRD 或目录，结合 `scenario-frontend-execute` 的检测清单识别重构机会（职责、状态、性能、a11y）。
2. **任务分组**：运用 `method-data-structure-first` 将重构项按数据结构或组件职责分组，评估风险与收益。
3. **计划输出**：按照优先级生成重构计划，明确所需语言/工具技能以及质量门。
4. **实施（可选）**：在同一命令中可逐项执行，并在每次改动后运行 `scenario-quality-gates` 定向验证。
5. **报告整理**：`--output` 可生成 Markdown 报告，包含任务列表、验证结果、回滚策略。

## 产出

- 重构任务列表：描述、风险、预期收益、涉及文件、所需技能。
- 质量门验证记录：每个任务后运行的 Lint/类型/测试/构建命令与结果。
- 建议的后续动作（如拆分 Story、补充基准测试、更新 CRD）。

## 异常处理

- 重构目标不明确：回到设计阶段，与负责人确认诉求。
- 质量门失败：自愈最多 3 次，仍失败需升级；记录阻塞原因。
- 造成行为回归：立即回滚并记录影响，补充测试或重新规划任务。
