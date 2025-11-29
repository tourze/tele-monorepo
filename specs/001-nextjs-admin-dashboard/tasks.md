# Tasks: NextJS 后台管理系统

**Input**: Design documents from `/specs/001-nextjs-admin-dashboard/`
**Prerequisites**: plan.md ✓, spec.md ✓, data-model.md ✓, research.md ✓, quickstart.md ✓

**Tests**: 未在规范中明确要求测试，故本任务列表不包含测试任务。如需添加测试，请告知。

**Organization**: 任务按用户故事分组，支持独立实现和测试。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可并行执行（不同文件，无依赖）
- **[Story]**: 所属用户故事（US1, US2, US3, US4）
- 所有路径基于 `packages/admin-dashboard/`

---

## Phase 1: Setup (项目初始化)

**Purpose**: 创建项目结构，安装依赖

- [X] T001 创建 package 目录 `packages/admin-dashboard/`
- [X] T002 使用 create-next-app 初始化 NextJS 项目（TypeScript + TailwindCSS + App Router）
- [X] T003 初始化 shadcn/ui 配置 `packages/admin-dashboard/components.json`
- [X] T004 [P] 配置 ESLint 和 Prettier `packages/admin-dashboard/.eslintrc.js`
- [X] T005 [P] 创建类型定义目录结构 `packages/admin-dashboard/src/types/`
- [X] T006 添加 Lucide React 图标库依赖

---

## Phase 2: Foundational (基础架构)

**Purpose**: 所有用户故事共享的核心基础设施

**⚠️ CRITICAL**: 用户故事实现必须等待此阶段完成

- [X] T007 定义 NavItem 类型 `packages/admin-dashboard/src/types/nav.ts`
- [X] T008 [P] 定义 LayoutConfig 类型 `packages/admin-dashboard/src/types/layout.ts`
- [X] T009 [P] 创建类型统一导出 `packages/admin-dashboard/src/types/index.ts`
- [X] T010 创建布局配置实例 `packages/admin-dashboard/src/config/layout.ts`
- [X] T011 创建导航配置实例（5个示例页面的菜单项）`packages/admin-dashboard/src/config/nav.ts`
- [X] T012 [P] 创建工具函数（cn 等）`packages/admin-dashboard/src/lib/utils.ts`
- [X] T013 添加 shadcn/ui 核心组件（button, card, sheet, separator, avatar, dropdown-menu）

**Checkpoint**: 基础架构就绪，可开始用户故事实现

---

## Phase 3: User Story 1 - 响应式后台访问 (Priority: P1) 🎯 MVP

**Goal**: 实现响应式布局框架，支持 PC/平板/移动端自适应

**Independent Test**: 在不同设备宽度下访问系统，验证布局正确适配

### Implementation for User Story 1

- [X] T014 [US1] 创建移动端检测 Hook `packages/admin-dashboard/src/hooks/use-mobile.ts`
- [X] T015 [P] [US1] 实现 Header 组件（顶部导航栏）`packages/admin-dashboard/src/components/layout/header.tsx`
- [X] T016 [P] [US1] 实现 Sidebar 组件（侧边栏导航）`packages/admin-dashboard/src/components/layout/sidebar.tsx`
- [X] T017 [US1] 实现 MobileNav 组件（移动端抽屉导航）`packages/admin-dashboard/src/components/layout/mobile-nav.tsx`
- [X] T018 [US1] 实现 MainLayout 组件（主布局容器）`packages/admin-dashboard/src/components/layout/main-layout.tsx`
- [X] T019 [US1] 创建根布局 `packages/admin-dashboard/src/app/layout.tsx`
- [X] T020 [US1] 配置全局样式 `packages/admin-dashboard/src/styles/globals.css`
- [X] T021 [US1] 创建首页（重定向到仪表盘）`packages/admin-dashboard/src/app/page.tsx`

**Checkpoint**: 响应式布局框架完成，可在不同设备上访问空白页面

---

## Phase 4: User Story 2 - 后台导航与页面结构 (Priority: P1)

**Goal**: 实现多级导航菜单，支持页面切换和当前位置指示

**Independent Test**: 点击导航项验证页面切换，检查当前项高亮

### Implementation for User Story 2

- [X] T022 [US2] 实现 NavItem 组件（单个导航项）`packages/admin-dashboard/src/components/layout/nav-item.tsx`
- [X] T023 [US2] 实现 NavGroup 组件（导航分组，支持子菜单）`packages/admin-dashboard/src/components/layout/nav-group.tsx`
- [X] T024 [US2] 更新 Sidebar 添加导航项渲染逻辑 `packages/admin-dashboard/src/components/layout/sidebar.tsx`
- [X] T025 [US2] 更新 MobileNav 添加导航项渲染逻辑 `packages/admin-dashboard/src/components/layout/mobile-nav.tsx`
- [X] T026 [US2] 添加路由激活状态检测 `packages/admin-dashboard/src/hooks/use-active-route.ts`
- [X] T027 [US2] 添加导航动画过渡效果

**Checkpoint**: 导航功能完成，可在页面间切换，当前页面高亮显示

---

## Phase 5: User Story 3 - 简洁现代视觉主题 (Priority: P2)

**Goal**: 应用 shadcn/ui 默认主题，确保视觉一致性

**Independent Test**: 视觉审查页面元素是否符合 shadcn/ui 设计规范

### Implementation for User Story 3

- [X] T028 [US3] 添加更多 shadcn/ui 组件（input, select, switch, tabs）
- [X] T029 [P] [US3] 创建 StatCard 组件（统计卡片）`packages/admin-dashboard/src/components/shared/stat-card.tsx`
- [X] T030 [P] [US3] 创建 PageHeader 组件（页面标题栏）`packages/admin-dashboard/src/components/shared/page-header.tsx`
- [X] T031 [P] [US3] 创建 ContentCard 组件（内容卡片容器）`packages/admin-dashboard/src/components/shared/content-card.tsx`
- [X] T032 [US3] 统一组件导出 `packages/admin-dashboard/src/components/shared/index.ts`

**Checkpoint**: 视觉主题统一，组件风格一致

---

## Phase 6: User Story 4 - 示例功能页面 (Priority: P3)

**Goal**: 创建5个示例页面展示 shadcn/ui 组件使用方式

**Independent Test**: 访问各示例页面验证组件正确渲染

### Mock Data Setup

- [X] T033 [P] [US4] 创建仪表盘模拟数据 `packages/admin-dashboard/src/data/mock/dashboard.ts`
- [X] T034 [P] [US4] 创建列表页模拟数据 `packages/admin-dashboard/src/data/mock/list.ts`
- [X] T035 [P] [US4] 创建表单页模拟数据 `packages/admin-dashboard/src/data/mock/form.ts`
- [X] T036 [P] [US4] 创建详情页模拟数据 `packages/admin-dashboard/src/data/mock/detail.ts`
- [X] T037 [P] [US4] 创建设置页模拟数据 `packages/admin-dashboard/src/data/mock/settings.ts`

### Page Components Setup (需先添加 shadcn/ui 组件)

- [X] T038 [US4] 添加 table 和 pagination 组件（列表页依赖）
- [X] T039 [US4] 添加 form 相关组件（表单页依赖）

### Page Implementation

- [X] T040 [US4] 实现仪表盘页面 `packages/admin-dashboard/src/app/dashboard/page.tsx`
- [X] T041 [US4] 实现数据列表页面 `packages/admin-dashboard/src/app/list/page.tsx`
- [X] T042 [US4] 实现表单页面 `packages/admin-dashboard/src/app/form/page.tsx`
- [X] T043 [US4] 实现详情页面 `packages/admin-dashboard/src/app/detail/page.tsx`
- [X] T044 [US4] 实现设置页面 `packages/admin-dashboard/src/app/settings/page.tsx`

**Checkpoint**: 全部5个示例页面可访问和交互

---

## Phase 7: Polish & 收尾

**Purpose**: 跨功能优化和文档完善

- [X] T045 [P] 添加加载状态组件 `packages/admin-dashboard/src/components/shared/loading.tsx`
- [X] T046 [P] 添加错误边界组件 `packages/admin-dashboard/src/components/shared/error-boundary.tsx`
- [X] T047 [P] 添加空状态组件 `packages/admin-dashboard/src/components/shared/empty-state.tsx`
- [X] T048 创建 loading.tsx 和 error.tsx 页面状态文件
- [X] T049 更新根 package.json 的 workspaces 配置（如需要）
- [X] T050 验证 quickstart.md 中的命令可正常执行
- [X] T051 响应式布局在 PC/平板/移动端的最终验证

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3-6 (User Stories) → Phase 7 (Polish)
                                              ↓
                                    [可并行执行或按优先级顺序]
```

### User Story Dependencies

| 用户故事 | 前置依赖 | 可否并行 |
|----------|----------|----------|
| US1 响应式布局 | Phase 2 完成 | 独立 |
| US2 导航结构 | US1 完成（需要布局框架） | 依赖 US1 |
| US3 视觉主题 | Phase 2 完成 | 可与 US1/US2 并行 |
| US4 示例页面 | US1 + US2 完成（需要导航和布局） | 依赖 US1/US2 |

### Parallel Opportunities

**Phase 2 并行任务**:
```bash
# 可同时执行:
Task T007: NavItem 类型
Task T008: LayoutConfig 类型
Task T009: 类型导出
Task T012: 工具函数
```

**US1 并行任务**:
```bash
# 可同时执行:
Task T015: Header 组件
Task T016: Sidebar 组件
```

**US4 模拟数据并行任务**:
```bash
# 可同时执行:
Task T033: dashboard mock
Task T034: list mock
Task T035: form mock
Task T036: detail mock
Task T037: settings mock
```

---

## Implementation Strategy

### MVP First (仅 User Story 1 + 2)

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational
3. 完成 Phase 3: User Story 1 (响应式布局)
4. 完成 Phase 4: User Story 2 (导航结构)
5. **验证点**: 空白的响应式后台框架可用
6. 可提前部署/演示

### 完整交付

1. MVP 完成后
2. 完成 Phase 5: User Story 3 (视觉主题)
3. 完成 Phase 6: User Story 4 (5个示例页面)
4. 完成 Phase 7: Polish
5. 最终验证

---

## Notes

- 所有路径相对于 `packages/admin-dashboard/`
- shadcn/ui 组件通过 CLI 添加，非手动创建
- [P] 标记的任务可并行执行
- 每个 Checkpoint 后验证功能独立可用
- 每完成一个任务或逻辑组后提交代码
