# Vibe-Shell OpenSpec 使用指南

这个文档说明如何在 Vibe-Shell 项目中使用 OpenSpec 规范驱动的开发流程。

## 快速开始

### 1. 验证配置

首先验证你的 OpenSpec 配置是否正确：

```bash
# 运行配置验证
npm run openspec:validate

# 或者使用 Node.js 脚本
node scripts/openspec-validate.js
```

### 2. 项目特定规范

每个子项目都有自己的配置文件：

- `apps/seven-fish-customer-service/.openspec` - 传统 React 项目规范
- `apps/utc-react/.openspec` - 现代化 React + TypeScript 项目规范

### 3. 共享规范文件

所有项目共享以下规范文件：

- `openspec/project.md` - 项目概览和技术栈说明
- `openspec/specs/react-standards/spec.md` - React 开发规范
- `openspec/specs/nx-workflow/spec.md` - Nx 工作区流程规范

## 开发流程

### 创建新功能

1. **检查现有规范**
   ```bash
   # 查看现有规范
   cat openspec/specs/react-standards/spec.md
   ```

2. **创建变更提案**（如果需要）
   ```bash
   # 在 openspec/changes/ 下创建新的变更提案
   mkdir -p openspec/changes/add-new-feature
   # 创建 proposal.md, tasks.md 等文件
   ```

3. **验证规范遵循**
   ```bash
   npm run openspec:validate
   ```

4. **实施开发**
   - 按项目特定的规范进行开发
   - 遵循代码质量标准

5. **构建和测试**
   ```bash
   # 构建所有项目
   npx nx run-many --target=build --all

   # 或构建特定项目
   npx nx seven-fish-customer-service:build
   npx nx utc-react:build
   ```

## 项目特定的开发规范

### seven-fish-customer-service (传统 React)

- **技术栈**: React 16.8 + Webpack 2.4 + Less
- **语言**: JavaScript
- **特色**: 微信 JS SDK 集成
- **代码规范**: 函数组件，ES6+ 语法
- **文件行数限制**: 500行

#### 关键要求：
- 使用函数式组件 + Hooks
- 组件命名使用 PascalCase
- 使用 Less 进行样式开发
- 遵循 Webpack 2.x 配置模式

### utc-react (现代化 React)

- **技术栈**: React 17 + UmiJS Max 4.1 + TypeScript 5.3
- **UI 库**: Ant Design 5.13 + Pro Components
- **特色**: 数据表格 (Handsontable), 复杂表单
- **代码规范**: 严格 TypeScript，ESLint + Prettier
- **文件行数限制**: 300行（页面组件）

#### 关键要求：
- 启用 TypeScript 严格模式
- 使用 `@/*` 路径别名
- 使用 Less modules (`styles.module.less`)
- API 调用使用统一的 `callAPI` 方法
- 组件优先使用箭头函数

## 共享的代码质量标准

### 所有人项目都必须遵循：

1. **文件长度限制**
   - 普通文件：≤ 500行
   - 页面组件：≤ 300行
   - 工具函数：≤ 50行

2. **函数长度限制**
   - 普通函数：≤ 100行
   - 工具函数：≤ 50行

3. **复杂度限制**
   - 圈复杂度：≤ 10
   - 嵌套深度：≤ 4层
   - 参数数量：≤ 5个

4. **React 组件规范**
   - 使用函数式组件 + Hooks
   - 组件命名：PascalCase
   - Props 接口：`ComponentNameProps`
   - 自定义 Hooks：以 `use` 开头

## API 通信模式

### utc-react 项目：
```javascript
import { callAPI } from '@/services/common';

// 统一的 JSON-RPC 调用
const response = await callAPI('methodName', { param1: value1 });
```

### seven-fish 项目：
- 直接使用 fetch 或 axios
- 遵循项目既定的 API 模式

## 构建和部署

### 开发命令：
```bash
# 启动 utc-react (端口 8007)
npm run utc-react:dev
# 或
npx nx utc-react:dev

# 启动 seven-fish-customer-service
npm run seven-fish:start
# 或
npx nx seven-fish-customer-service:serve

# 构建所有项目
npx nx run-many --target=build --all
```

### 特殊要求：
- **utc-react**: 构建后需手动在 index.html 中添加 `lang="en"`
- **静态资源路径**: `/calculator/` (utc-react)

## 权限管理

项目支持基于角色的权限控制：
- **管理员**: `localStorage.getItem('isAdmin')`
- **读写用户**: 完整功能访问
- **只读用户**: 仅查看权限

## 常见问题

### Q: 如何添加新的 OpenSpec 规范？
A: 在 `openspec/specs/` 下创建新的规范目录和 `spec.md` 文件。

### Q: 修改规范后如何生效？
A: 规范文件位于 `sharedGlobals` 中，会自动影响构建缓存。修改后重新构建即可。

### Q: 如何验证代码是否符合规范？
A: 运行 `npm run openspec:validate` 进行全面的规范验证。

### Q: 两个子项目的规范冲突怎么办？
A: 每个项目都有独立的 `.openspec` 配置文件，可以在项目级别覆盖共享规范。

## 最佳实践

1. **开始开发前**：先检查相关规范文件
2. **代码审查**：使用规范作为审查标准
3. **持续改进**：根据实际开发需要调整规范
4. **团队沟通**：规范变更前与团队讨论

## 联系方式

如有问题或建议，请：
1. 查看相关规范文件
2. 运行验证脚本检查配置
3. 与团队讨论规范变更