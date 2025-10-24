# VibeShell

基于 Nx 的开发环境，用于管理多个 Gitee 项目。

## 克隆项目

```bash
# 克隆所有配置的项目
npm run gitee:clone

# 直接克隆指定仓库到apps目录
npm run gitee:clone https://gitee.com/umworks/utc-react.git
```

## 运行项目

进入 `apps/` 目录下的具体项目，安装依赖并运行：

```bash
# 示例：进入项目并运行
cd apps/your-project-name

# 安装依赖
npm install
# 或
yarn
# 或
pnpm install (注意：utc-react项目不要使用pnpm)

# 启动项目
npm run dev
# 或
npm start
```

⚠️ **注意**：utc-react项目必须使用 `npm install` 或 `yarn install`，不要使用pnpm，否则会出现模块解析错误。

## 子仓库分支管理

### 切换分支

```bash
# 进入子项目目录
cd apps/your-project-name

# 查看所有分支
git branch -a

# 切换到指定分支
git checkout branch-name

# 创建并切换到新分支
git checkout -b new-branch-name
```

### 提交子仓库更新

子仓库的更新需要自行推送到各自的 Gitee 仓库：

```bash
# 进入子项目目录
cd apps/your-project-name

# 查看变更
git status

# 添加文件并提交
git add .
git commit -m "your commit message"

# 推送到 Gitee 仓库
git push

# 推送指定分支
git push origin branch-name
```

## OpenSpec 开发规范

项目使用 OpenSpec 进行规范驱动的开发管理，确保代码质量和一致性。

### 快速验证

```bash
# 检查 OpenSpec 配置是否正确
npm run openspec:validate
```

### 查看规范

- 📋 [项目概览](openspec/project.md) - 技术栈和架构说明
- 🔧 [React 开发规范](openspec/specs/react-standards/spec.md) - 组件开发标准
- ⚙️ [Nx 工作区规范](openspec/specs/nx-workflow/spec.md) - 多项目管理流程

### 项目启动

```bash
# UTC 项目 (React 17 + TypeScript)
npm run utc-react:dev

# Seven Fish 项目 (React 16 + JavaScript)
npm run seven-fish:start
```

### 规范要点

- **组件规范**: 函数组件 + TypeScript (utc-react) / JavaScript (seven-fish)
- **代码质量**: 文件行数限制，复杂度控制
- **样式规范**: Less modules + antd-style
- **API 调用**: 统一的 `callAPI` 模式

---

**项目配置在 `gitee-projects.json` 中**