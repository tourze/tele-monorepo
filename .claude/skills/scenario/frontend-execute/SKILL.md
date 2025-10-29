---
name: scenario-frontend-execute
description: 当需要按 CRD 执行前端特性实现，结合语言与工具技能完成开发与质量门检验时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# 前端实施技能

## 适用场景

- 依据 CRD (组件需求文档) 执行前端组件、Hooks、样式的开发。
- 在通用实施流程中，应用前端特有的质量门和构建工具。

## 前置准备

- 已获得 `scenario/feature-execution` 的任务拆解、时间表与质量门清单。
- 阅读对应 CRD，确认组件 API、状态流、可访问性与视觉要求；记录疑问并同步设计/后端。
- 准备前端开发环境：Node.js 版本、包管理器、Lint/测试工具、Storybook 等设施。
- 对齐数据契约与模拟方案（Mock、Playwright fixture），确保离线可验证。

## 与通用实施的关系

本技能遵循 `scenario/feature-execution` 的核心状态机（解析 → 预检 → 执行 → 质量门 → 报告），但在“执行”和“质量门”阶段应用前端专属技能。

## 操作步骤

1. **预检与任务拆解**
   - 对照 CRD 的组件树与状态图，划分开发子任务并在任务板登记。
   - 核对依赖环境、基础设施（Mock 服务、Storybook）能否运行，缺失时先补齐。
2. **组件与逻辑实现**
   - 参照 `language/js-frontend-react`、`language/js-react-hooks` 实现组件与复用逻辑。
   - 依据 `language/js-react-state-management` 接入全局状态、服务端数据与缓存策略。
3. **样式与可访问性**
   - 引用 `language/js-frontend-presentation`，实现设计系统、主题切换、a11y 属性。
   - 通过视觉回归（Chromatic/Storybook）验证关键组件的表现一致性。
4. **质量门执行**
   - 在 `scenario/quality-gates` 流程下，执行前端质量门：
     - 格式：`tool/js-prettier`
     - 静态分析：`tool/js-eslint`、`tool/ts-tsc`
     - 测试：`tool/js-vitest`（单元/组件/集成）或 Playwright（如需端到端）
     - 构建：`tool/js-vite-bundler`
5. **同步与交付**
   - 更新图表、CRD 附录或设计文档，记录实现偏差与原因。
   - 在总结中说明质量门结果、性能指标、已知风险与后续观察项。

## 质量校验

- 遵循 `feature-execution` 的所有质量门。
- **额外**: Storybook/Chromatic 视觉回归测试通过，Lighthouse/Web Vitals 性能指标达标。

## 交付物

- 继承自 `feature-execution` 的所有交付物。
- **额外**: 组件源码、Storybook 示例、前端单元/组件测试报告。

## 失败与回滚

- 当实现偏离 CRD 或与设计评审冲突时，暂停上线，回滚到最后通过验证的 commit，并邀请设计/后端重新对齐。
- 质量门（Lighthouse、Chromatic、Vitest）未通过，必须先修复或记录例外卡，禁止跳过直接合并；必要时恢复到稳定版本重新评估。
- 若引入新依赖导致构建失败，回退依赖版本或拆分提交，确保主干保持可构建状态。
