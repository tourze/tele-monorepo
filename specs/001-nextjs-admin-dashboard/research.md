# Research: NextJS 后台管理系统

**Date**: 2025-11-29
**Feature**: 001-nextjs-admin-dashboard

## 研究任务

本项目技术栈已明确（NextJS + shadcn/ui + TailwindCSS），无需额外澄清。以下记录关键技术决策和最佳实践。

---

## 1. NextJS 版本选择

**Decision**: Next.js 14.x (App Router)

**Rationale**:
- App Router 是 Next.js 推荐的新架构，支持 React Server Components
- 更好的布局嵌套支持，适合后台管理系统的多层布局需求
- 内置的 loading.tsx 和 error.tsx 处理页面状态
- 与 shadcn/ui 官方文档完全兼容

**Alternatives Considered**:
- Next.js 15 (最新): 太新，生态兼容性待验证
- Pages Router: 旧架构，不推荐新项目使用

---

## 2. shadcn/ui 集成方式

**Decision**: 使用 shadcn/ui CLI 按需添加组件

**Rationale**:
- 组件代码直接复制到项目中，完全可控
- 按需添加，避免不必要的依赖
- 默认主题开箱即用，满足"简洁现代"需求
- 与 TailwindCSS 无缝集成

**Required Components** (基于功能需求):
- `button` - 按钮
- `card` - 卡片容器
- `table` - 数据表格
- `input` - 输入框
- `select` - 选择器
- `switch` - 开关
- `tabs` - 标签页
- `sheet` - 抽屉（移动端导航）
- `separator` - 分隔线
- `avatar` - 头像
- `dropdown-menu` - 下拉菜单
- `form` - 表单 (react-hook-form 集成)
- `pagination` - 分页

---

## 3. 响应式布局策略

**Decision**: TailwindCSS 断点 + 条件渲染

**Rationale**:
- TailwindCSS 内置断点满足需求：`sm`(640px), `md`(768px), `lg`(1024px)
- 移动端使用 Sheet 组件实现抽屉导航
- 平板/PC 使用固定侧边栏

**Breakpoints Mapping**:
| 设备 | 断点 | 侧边栏行为 |
|------|------|------------|
| 移动端 | <768px (md) | 隐藏，汉堡菜单触发抽屉 |
| 平板 | 768-1023px | 可折叠侧边栏 |
| PC | ≥1024px (lg) | 固定展开侧边栏 |

---

## 4. 导航配置方案

**Decision**: 静态配置文件 + 类型定义

**Rationale**:
- 后台导航结构相对固定，无需动态加载
- TypeScript 类型确保配置正确性
- 支持多级嵌套和图标配置

**NavItem Type**:
```typescript
interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
  disabled?: boolean;
}
```

---

## 5. 状态管理

**Decision**: 无全局状态管理库

**Rationale**:
- 纯 UI 框架，无复杂状态
- React 内置状态（useState, useContext）足够
- 导航状态通过 URL 管理（Next.js router）
- 表单状态使用 react-hook-form

**Alternatives Considered**:
- Zustand: 过度工程化，当前场景不需要
- Redux: 过度工程化

---

## 6. 图标方案

**Decision**: Lucide React

**Rationale**:
- shadcn/ui 默认推荐
- 图标风格与 shadcn/ui 一致
- 按需导入，bundle size 可控

---

## 7. 测试策略

**Decision**: Vitest + React Testing Library

**Rationale**:
- Vitest 与 Vite 生态兼容，速度快
- React Testing Library 关注用户行为而非实现细节
- 组件测试覆盖关键交互

**Test Scope**:
- 布局组件渲染测试
- 导航展开/收起行为
- 响应式断点切换

---

## 8. Monorepo 集成

**Decision**: 独立 package，不依赖其他 workspace packages

**Rationale**:
- NextJS 项目与 React Native 项目独立
- 避免依赖提升问题
- 使用 workspace 管理但保持隔离

**Package Name**: `admin-dashboard`

**Workspace Config** (需添加到根 package.json 的 nohoist):
```json
"**/@next",
"**/@next/**",
"**/next",
"**/next/**"
```

---

## 总结

所有技术决策已明确，无 NEEDS CLARIFICATION 项。可进入 Phase 1 设计阶段。
