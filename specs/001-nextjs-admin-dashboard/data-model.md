# Data Model: NextJS 后台管理系统

**Date**: 2025-11-29
**Feature**: 001-nextjs-admin-dashboard

## 概述

本项目为纯前端 UI 框架，无后端存储需求。以下数据模型仅用于前端类型定义和模拟数据结构。

---

## 核心实体

### 1. NavItem - 导航项

```typescript
import { LucideIcon } from 'lucide-react';

interface NavItem {
  /** 导航项唯一标识 */
  id: string;
  /** 显示标题 */
  title: string;
  /** 路由路径 */
  href: string;
  /** 图标组件 */
  icon?: LucideIcon;
  /** 子导航项（支持多级嵌套） */
  children?: NavItem[];
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否在新标签页打开 */
  external?: boolean;
}
```

**Validation Rules**:
- `id` 必须唯一
- `href` 必须以 `/` 开头（内部链接）或 `http` 开头（外部链接）
- `children` 最多支持 2 级嵌套

---

### 2. LayoutConfig - 布局配置

```typescript
interface LayoutConfig {
  /** 侧边栏配置 */
  sidebar: {
    /** 展开宽度 (px) */
    width: number;
    /** 收起宽度 (px) */
    collapsedWidth: number;
    /** 默认是否收起 */
    defaultCollapsed: boolean;
  };
  /** 顶部栏配置 */
  header: {
    /** 高度 (px) */
    height: number;
    /** 是否固定在顶部 */
    fixed: boolean;
  };
  /** 响应式断点 */
  breakpoints: {
    mobile: number;  // <768px
    tablet: number;  // 768-1023px
    desktop: number; // ≥1024px
  };
}
```

**Default Values**:
```typescript
const defaultLayoutConfig: LayoutConfig = {
  sidebar: {
    width: 240,
    collapsedWidth: 64,
    defaultCollapsed: false,
  },
  header: {
    height: 56,
    fixed: true,
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1024,
  },
};
```

---

### 3. User - 用户（模拟数据）

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'guest';
}
```

**Note**: 仅用于示例页面的头像和用户信息展示，无真实认证逻辑。

---

## 示例页面数据结构

### Dashboard 仪表盘

```typescript
interface StatCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
}

interface DashboardData {
  stats: StatCard[];
  // 图表数据占位（本期不实现真实图表）
  chartPlaceholder: boolean;
}
```

### List 数据列表

```typescript
interface ListItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

interface ListPageData {
  items: ListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}
```

### Form 表单

```typescript
interface FormData {
  name: string;
  email: string;
  description?: string;
  category: string;
  enabled: boolean;
  tags: string[];
}
```

### Detail 详情

```typescript
interface DetailData {
  id: string;
  title: string;
  content: string;
  metadata: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}
```

### Settings 设置

```typescript
interface SettingsData {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
  };
  privacy: {
    publicProfile: boolean;
    showEmail: boolean;
  };
}
```

---

## 状态与生命周期

### 导航状态

```
[Collapsed] <--toggle--> [Expanded]
     ^                        |
     |                        |
     +---- (mobile) ----------+
           (auto-collapse on route change)
```

### 移动端导航抽屉状态

```
[Closed] --open--> [Open] --close/route-change--> [Closed]
```

---

## 文件结构

```text
src/
├── types/
│   ├── nav.ts           # NavItem 类型定义
│   ├── layout.ts        # LayoutConfig 类型定义
│   └── index.ts         # 统一导出
├── config/
│   ├── nav.ts           # 导航配置实例
│   └── layout.ts        # 布局配置实例
└── data/
    └── mock/            # 示例页面模拟数据
        ├── dashboard.ts
        ├── list.ts
        ├── form.ts
        ├── detail.ts
        └── settings.ts
```
