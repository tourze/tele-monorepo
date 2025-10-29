---
name: scenario-frontend-design
description: 推进前端 CRD 设计，在通用功能设计基础上，补充前端特有的组件、状态与交互方案。
---

# 前端设计技能 (CRD)

## 适用场景
- 针对前端特性或组件库进行详细设计，输出 CRD (Component Requirement Document)。
- 在通用设计流程基础上，补充前端领域的设计细节。

## 与通用设计的关系
本技能遵循 `scenario/feature-design` 的核心流程，包括商业价值对齐、风险评估、计划与验收标准定义。在此基础上，本技能专注于前端特有的设计产出。

## 前端专属设计要点
1.  **组件与页面逻辑**
    *   使用 Mermaid 绘制组件树，明确组件层级、复用关系和数据流。
    *   定义组件的 Props、State、Slots 和对外暴露的事件。
2.  **状态管理方案**
    *   依据 `language/js-react-state-management` 技能，明确全局状态、视图状态和局部状态的归属。
    *   设计 Store 结构、Action、Selector，以及与后端 API 的同步策略。
3.  **API 契约**
    *   定义前端所需的数据结构、接口路径、请求/响应格式，作为与后端的契约。
4.  **交互与视觉**
    *   引用 `language/js-frontend-presentation` 技能，对齐设计系统、a11y (可访问性) 和视觉表现。
    *   使用 `scenario/prd-visual-optimizer` 确保图表与表格一致。

## 质量校验
- CRD 包含完整的组件树、状态流图、API 契约和 a11y 要求。
- 设计遵循 `feature-design` 的所有质量门，并额外通过前端设计评审。

## 交付物
- 继承自 `feature-design` 的所有交付物。
- **额外**: 完整的 CRD 文档、组件 API 定义、状态管理方案图。
