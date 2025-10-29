---
name: js-frontend-presentation
description: 当需要规划前端表现层，确保组件拆分、设计系统对齐、可访问性与视觉一致性时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# 前端表现层技能

## 适用场景

- 构建视图组件、页面布局、设计系统实现。
- 处理响应式布局、主题、动画、可访问性。
- 确保视觉一致、代码易读、样式可维护。

## 前置准备

- 获取设计稿（Figma）、设计令牌（Design Tokens）、组件规范。
- 确认样式方案（CSS Modules、Tailwind、Chakra、styled-components 等）。
- 准备 Storybook 或组件文档工具，建立展示与对比环境。

## 操作步骤

1. **组件分层**
   - 依据 Atomic Design 或团队约定划分：基础组件（atoms）、复合组件（molecules）、页面容器（organisms/page）。
   - 表现组件只负责渲染；业务逻辑放在上层容器或 Hook。
2. **设计系统对齐**
   - 使用设计令牌：颜色、字体、间距、阴影通过 token 管理。
   - 主题切换：context + CSS 变量，遵循最小权限原则。
   - 保持可组合性：组件支持 `className`/`style` 透传，但避免过度定制。
3. **样式管理**
   - CSS Modules/Scoped CSS：命名遵循 BEM 或约定俗成。
   - Tailwind/Utility-first：抽离复杂样式到组合类或组件。
   - 避免深层选择器、!important；跨组件共享通过变量或 mixin。
4. **响应式与布局**
   - 使用 CSS Grid/Flex 构建布局；移动端优先设计。
   - 断点策略：统一定义 `xs/sm/md/lg/xl`，对应设计稿。
   - 大屏布局允许内容中断断点，保持可读性。
5. **可访问性 (a11y)**
   - 使用语义化标签、`aria-*` 属性、键盘导航、焦点管理。
   - 表单组件提供 label、错误提示、辅助文本。
   - 使用 `jest-axe`、`@testing-library/jest-dom` 验证 a11y。
6. **动画与交互**
   - 使用 CSS Transition、Framer Motion 等库；注意性能（避免 Layout Thrashing）。
   - 复杂动画可提供“减少动画”选项，尊重操作系统设置。
7. **文档与展示**
   - Storybook 展示状态（Default/Loading/Error），提供 Controls。
   - 可视对比（Chromatic、Loki）检测视觉回归。
   - 维护组件 API 文档（Props、Slot、事件）。

## 质量校验

- 组件测试（Testing Library / Storybook interaction）验证交互与样式。
- 可访问性检测通过（Accessibility Audit、jest-axe）。
- Lighthouse/Web Vitals 保持在绿线（LCP < 2.5s、CLS < 0.1）。
- 无重复 CSS、无未使用样式，打包体积在阈值内。

## 失败与回滚

- 设计偏差：及时与设计师同步；必要时回滚样式改动，记录差异。
- 可访问性不合规：修复语义、焦点或对比度问题，重新审查。
- 样式冲突或回归：启用可视对比/截图测试，恢复之前版本并拆分提交。

## 交付物

- 组件文档（Storybook 链接、Props 表）、设计对齐报告。
- 样式/主题定义、Design Token 文件。
- 可访问性与性能测试结果（Lighthouse、jest-axe）。
