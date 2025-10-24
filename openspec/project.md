# Vibe-Shell 项目概览

一个基于 Nx 的多项目工作区，包含不同技术栈的 React 应用，采用 OpenSpec 进行规范驱动的开发流程管理。

## 技术栈

### 工作区管理
- **Monorepo 工具**: Nx
- **包管理器**: npm
- **Node.js 版本**: >=12.0.0 (兼容 utc-react 要求)

### 子项目技术栈

#### seven-fish-customer-service
- **框架**: React 16.8.0
- **构建工具**: Webpack 2.4.1 + Babel 6
- **样式**: Less + CSS
- **路由**: React Router DOM 5.2.0
- **状态管理**: React 内置
- **特殊依赖**: weixin-js-sdk (微信集成)

#### utc-react (UTC 测算工具)
- **框架**: React 17.0.2 + UmiJS Max 4.1.1
- **UI 库**: Ant Design 5.13.2 + Pro Components
- **样式**: Less modules + antd-style (CSS-in-JS)
- **数据表格**: Handsontable + FortuneSheet
- **状态管理**: UmiJS 内置 model 系统
- **TypeScript**: 5.3.3 (严格模式)
- **代码规范**: ESLint + Prettier + 自定义规则

## 项目结构

```
vibe-shell/
├── apps/
│   ├── seven-fish-customer-service/    # 传统 React 项目
│   │   ├── client/                     # 源代码目录
│   │   ├── webpack/                    # Webpack 配置
│   │   └── package.json
│   └── utc-react/                      # 现代化 React 项目
│       ├── src/
│       │   ├── pages/                  # 页面组件
│       │   ├── components/             # 共享组件
│       │   ├── services/               # API 服务
│       │   ├── models/                 # UmiJS models
│       │   └── utils/                  # 工具函数
│       ├── config/                     # UmiJS 配置
│       └── package.json
├── openspec/                           # OpenSpec 规范目录
│   ├── project.md                      # 项目概览
│   ├── AGENTS.md                       # AI 助手指南
│   ├── specs/                          # 当前功能规范
│   └── changes/                        # 变更提案
├── nx.json                             # Nx 配置
└── package.json                        # 根级依赖
```

## 编码规范

### TypeScript 规范 (utc-react 项目)
- 启用严格模式
- 使用 `@/*` 和 `@@/*` 路径别名
- 函数组件优先使用箭头函数
- 禁用 `any` 类型，优先明确类型定义

### 代码质量标准
- **文件行数限制**: 500行 (页面组件 300行)
- **函数行数限制**: 100行 (工具函数 50行)
- **复杂度限制**: 圈复杂度 ≤ 10
- **嵌套深度**: ≤ 4层
- **参数数量**: ≤ 5个

### React 组件规范
- 使用函数式组件 + Hooks
- 组件命名使用 PascalCase
- Props 接口命名使用 `ComponentNameProps`
- 自定义 Hooks 以 `use` 开头

### 样式规范
- **utc-react**: 使用 Less modules (`styles.module.less`)
- **seven-fish**: 传统 CSS/Less
- 全局样式使用 antd-style 进行动态样式管理

## API 通信模式

### 统一 API 调用规范
```javascript
// utc-react 项目
import { callAPI } from '@/services/common';
const response = await callAPI('methodName', { param1: value1 });

// seven-fish 项目
// 直接使用 fetch 或 axios
```

### JSON-RPC 标准
- 所有 API 调用使用 JSON-RPC 格式
- 统一错误处理机制
- Bearer Token 认证 (存储在 cookies)

## 构建和部署

### 开发命令
```bash
# 启动 utc-react (端口 8007)
npx nx utc-react:dev

# 启动 seven-fish-customer-service
npx nx seven-fish-customer-service:serve

# 构建所有项目
npx nx run-many --target=build --all
``

### 构建要求
- **utc-react**: 构建后需手动在 index.html 中添加 `lang="en"`
- **静态资源路径**: `/calculator/` (utc-react)
- **环境变量**: 支持 `REACT_APP_ENV` 和 `UMI_ENV`

## 权限和安全

### 角色权限管理
- **管理员**: `localStorage.getItem('isAdmin')`
- **读写用户**: 完整功能访问权限
- **只读用户**: 仅查看权限

### 安全最佳实践
- API 调用使用 Bearer Token
- 敏感操作进行权限验证
- 避免在前端暴露业务逻辑

## 特殊功能模块

### UTC 项目复杂模块
1. **项目管理 (`/project/:id`)**
   - 基础信息配置
   - 活动范围设置
   - 品牌概算 (Handsontable)
   - SKU 管理
   - 详情汇总

2. **动态页面 (`/diy-list/:api`)**
   - 后端驱动的表单配置
   - 动态渲染和数据绑定

### 微信集成 (seven-fish)
- 使用 weixin-js-sdk
- 支持微信分享和支付功能

## OpenSpec 集成

### 规范验证
- 构建前自动执行 OpenSpec 验证
- 共享规范文件位于 `openspec/` 目录
- 每个子项目可有项目特定的 `.openspec` 配置

### 开发流程
1. 创建变更提案 (`openspec/changes/`)
2. 验证规范 (`npx nx run openspec-validate`)
3. 实施开发
4. 归档变更

## 测试策略

### 当前状态
- utc-react: 配置了 Jest 但暂无测试用例
- seven-fish: 无测试框架配置

### 建议的测试方法
-优先添加关键功能的冒烟测试
- 使用现有 ESLint 配置进行代码质量检查
- 手动测试复杂交互功能

## 开发工作流

### 新功能开发
1. 检查现有 OpenSpec 规范
2. 创建或更新变更提案
3. 按项目规范实施开发
4. 运行构建和验证
5. 更新相关文档

### 代码审查要点
- 是否符合项目的 ESLint 规则
- TypeScript 类型定义是否完整
- 组件是否可复用和可测试
- API 调用是否使用统一模式