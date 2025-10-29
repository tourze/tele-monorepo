---
name: scenario-frontend-execute
description: 执行前端特性实现，在通用实施流程上，应用前端语言/工具技能完成开发与质量门检验。
---

# 前端实施技能

## 适用场景
- 依据 CRD (组件需求文档) 执行前端组件、Hooks、样式的开发。
- 在通用实施流程中，应用前端特有的质量门和构建工具。

## 与通用实施的关系
本技能遵循 `scenario/feature-execution` 的核心状态机（解析 → 预检 → 执行 → 质量门 → 报告），但在“执行”和“质量门”阶段应用前端专属技能。

## 前端专属实施要点
1.  **组件与逻辑实现**
    *   遵循 `language/js-frontend-react` 和 `language/js-react-hooks` 技能，实现组件和可复用逻辑。
    *   遵循 `language/js-react-state-management`，对接全局状态和数据源。
2.  **样式与表现层**
    *   遵循 `language/js-frontend-presentation`，实现样式、主题和 a11y 要求。
3.  **前端质量门**
    *   在 `scenario/quality-gates` 基础上，重点执行前端质量门：
        *   格式: `tool/js-prettier`
        *   静态分析: `tool/js-eslint`, `tool/ts-tsc`
        *   测试: `tool/js-vitest` (单元/组件/集成)
        *   构建: `tool/js-vite-bundler`

## 质量校验
- 遵循 `feature-execution` 的所有质量门。
- **额外**: Storybook/Chromatic 视觉回归测试通过，Lighthouse/Web Vitals 性能指标达标。

## 交付物
- 继承自 `feature-execution` 的所有交付物。
- **额外**: 组件源码、Storybook 示例、前端单元/组件测试报告。
