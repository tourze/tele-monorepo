# Quickstart: NextJS 后台管理系统

**Date**: 2025-11-29
**Feature**: 001-nextjs-admin-dashboard

## 先决条件

- Node.js 20+
- Yarn 1.22+（项目使用 Yarn workspaces）
- 现代浏览器（Chrome/Firefox/Safari/Edge）

## 快速开始

### 1. 创建 Package

```bash
# 进入 monorepo 根目录
cd /Users/air/work/telescope/tele-monorepo

# 创建 admin-dashboard package 目录
mkdir -p packages/admin-dashboard
cd packages/admin-dashboard

# 初始化 Next.js 项目
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 2. 安装 shadcn/ui

```bash
# 初始化 shadcn/ui
npx shadcn@latest init

# 选择配置：
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### 3. 添加所需组件

```bash
# 添加核心组件
npx shadcn@latest add button card table input select switch tabs sheet separator avatar dropdown-menu form pagination
```

### 4. 启动开发服务器

```bash
# 从 package 目录启动
yarn dev

# 或从 monorepo 根目录启动
cd ../..
yarn workspace admin-dashboard dev
```

访问 http://localhost:3000 查看后台系统。

## 目录结构

```text
packages/admin-dashboard/
├── src/
│   ├── app/                  # 页面路由
│   │   ├── layout.tsx        # 根布局（含导航）
│   │   ├── page.tsx          # 首页
│   │   ├── dashboard/        # 仪表盘
│   │   ├── list/             # 数据列表
│   │   ├── form/             # 表单
│   │   ├── detail/           # 详情
│   │   └── settings/         # 设置
│   ├── components/
│   │   ├── ui/               # shadcn/ui 组件
│   │   └── layout/           # 布局组件
│   ├── config/               # 配置文件
│   ├── hooks/                # 自定义 Hooks
│   ├── lib/                  # 工具函数
│   └── types/                # 类型定义
└── tests/                    # 测试文件
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `yarn dev` | 启动开发服务器 |
| `yarn build` | 构建生产版本 |
| `yarn start` | 启动生产服务器 |
| `yarn lint` | 运行 ESLint 检查 |
| `yarn test` | 运行测试 |

## 添加新页面

1. 在 `src/app/` 下创建新目录和 `page.tsx`
2. 在 `src/config/nav.ts` 中添加导航项
3. 导航会自动更新

**示例**：添加 `/users` 页面

```tsx
// src/app/users/page.tsx
export default function UsersPage() {
  return <div>用户管理</div>;
}
```

```typescript
// src/config/nav.ts
export const navItems: NavItem[] = [
  // ... 现有项
  {
    id: 'users',
    title: '用户管理',
    href: '/users',
    icon: Users,
  },
];
```

## 自定义主题

shadcn/ui 使用 CSS 变量，可在 `src/styles/globals.css` 中修改：

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... 其他变量 */
}
```

详见 [shadcn/ui 主题文档](https://ui.shadcn.com/docs/theming)

## 响应式调试

- 使用浏览器开发者工具的设备模拟器
- 断点参考：
  - 移动端：<768px
  - 平板：768-1023px
  - PC：≥1024px

## 下一步

1. 阅读 [spec.md](./spec.md) 了解完整功能需求
2. 阅读 [data-model.md](./data-model.md) 了解数据结构
3. 执行 `/speckit.tasks` 生成任务分解
