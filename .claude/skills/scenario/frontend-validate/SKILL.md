---
name: scenario-frontend-validate
description: 验证前端特性是否达标，在通用验证流程上，补充前端特有的性能、a11y 与浏览器兼容性测试。
---

# 前端验证技能

## 适用场景
- 对照 CRD 的验收标准，验证前端特性是否完整、可用、可靠。
- 在通用验证流程中，补充前端专项测试。

## 与通用验证的关系
本技能遵循 `scenario/feature-validation` 的核心流程（读取标准 → 执行质量门 → 差距分析 → 生成报告），但在“执行质量门”和“差距分析”阶段补充前端专属的验证维度。

## 前端专属验证要点
1.  **功能与交互验证**
    *   执行 E2E 测试 (Playwright/Cypress)，覆盖关键用户旅程。
    *   在不同设备和浏览器（Chrome, Firefox, Safari）上进行交叉兼容性测试。
2.  **性能指标 (Web Vitals)**
    *   使用 Lighthouse 或 `web-vitals` 库测量 LCP, FID, CLS 等核心指标，确保其在“良好”阈值内。
3.  **可访问性 (a11y) 审计**
    *   使用 `axe-core` (集成于 Jest/Storybook/Playwright) 自动扫描 a11y 问题。
    *   手动进行键盘导航和屏幕阅读器测试。
4.  **构建产物验证**
    *   使用 `source-map-explorer` 或 `vite-plugin-visualizer` 分析包体积，确保无非预期的大依赖引入。

## 质量校验
- 遵循 `feature-validation` 的所有质量门。
- **额外**: Lighthouse 分数 > 90，a11y 审计无严重问题，主要浏览器兼容性报告通过。

## 交付物
- 继承自 `feature-validation` 的所有交付物。
- **额外**: 浏览器兼容性测试矩阵，性能与 a11y 审计报告，Bundle 体积分析截图。
