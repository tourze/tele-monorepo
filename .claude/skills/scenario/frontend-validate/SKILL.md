---
name: scenario-frontend-validate
description: 当需要验证前端特性是否达标，补充性能、可访问性与浏览器兼容性测试时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# 前端验证技能

## 适用场景

- 对照 CRD 的验收标准，验证前端特性是否完整、可用、可靠。
- 在通用验证流程中，补充前端专项测试。

## 前置准备

- 获取最新的 CRD、体验验收标准、质量门列表以及 `scenario/feature-validation` 的验证计划。
- 准备测试环境：真实设备或云端设备、浏览器矩阵、网络模拟工具、可访问性辅助工具。
- 确认性能与埋点监控已接入，能够采集 Web Vitals、业务转化等指标。
- 对齐回滚或热修机制，确保验证中发现阻塞问题时可快速止损。

## 与通用验证的关系

本技能遵循 `scenario/feature-validation` 的核心流程（读取标准 → 执行质量门 → 差距分析 → 生成报告），但在“执行质量门”和“差距分析”阶段补充前端专属的验证维度。

## 操作步骤

1. **读取标准与场景梳理**
   - 整理功能、交互、性能、a11y、兼容性等维度的验收标准。
   - 输出测试矩阵：浏览器 × 设备 × 网络条件 × 用户角色。
2. **功能与交互验证**
   - 执行 Playwright/Cypress E2E 用例覆盖关键旅程；补充手动探索测试。
   - 在 Chrome、Firefox、Safari、Edge 等浏览器上复测核心流程。
3. **性能与稳定性测试**
   - 运行 Lighthouse（桌面+移动），记录 Web Vitals；必要时使用 `web-vitals` 脚本收集真实值。
   - 通过 Network/CPU 模拟检查弱网、低端设备体验。
4. **可访问性审计**
   - 接入 `axe-core`、`@testing-library/jest-dom` 或 Playwright a11y 扫描，记录问题等级。
   - 手动执行键盘导航、屏幕阅读器（VoiceOver/NVDA）验证关键流程。
5. **构建产物与回归**
   - 使用 `source-map-explorer`、`vite-plugin-visualizer` 检查包体积与分布。
   - 核验 Source Map、错误日志、监控告警是否正常，整理报告并与干系人评审。

## 质量校验

- 遵循 `feature-validation` 的所有质量门。
- **额外**: Lighthouse 分数 > 90，a11y 审计无严重问题，主要浏览器兼容性报告通过。

## 交付物

- 继承自 `feature-validation` 的所有交付物。
- **额外**: 浏览器兼容性测试矩阵，性能与 a11y 审计报告，Bundle 体积分析截图。

## 失败与回滚

- 验证中发现阻塞缺陷或严重性能退化时，立即通知执行团队并挂起发布，使用预先对齐的回滚/热修流程恢复到稳定版本。
- 若 a11y 或兼容性报告未达标，应回到实现阶段补齐，禁止带着已知红线上线；必要时记录例外卡并说明临时护栏。
- Lighthouse 或 Web Vitals 低于阈值时，回滚到上一版本测量数据，定位新增资源或交互，逐项修复后重新测试。
