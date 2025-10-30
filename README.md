# VibeShell

基于 Nx 的开发环境，用于管理多个 Gitee 项目。

## 安装

执行：

```shell
npm add --global nx
```

## 克隆项目

```bash
# 克隆新项目并添加到项目列表
npm run clone-project micro-mall https://gitee.com/umworks/micro-mall

# 更新现有项目
npm run update-project micro-mall

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
yarn install
# 注意：所有子仓库都不要使用pnpm安装

# 启动项目
npm run dev
# 或
npm start
```

⚠️ **注意**：所有子仓库都必须使用 `npm install` 或 `yarn install`，不要使用pnpm，否则会出现模块解析错误。

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

### 🛠️ 项目启动
```bash
# UTC 项目 (React 17 + TypeScript)
npm run utc-react:dev

# Seven Fish 项目 (React 16 + JavaScript)
npm run seven-fish:start
```

## 🔄 仓库拆分工具

`repo-split.sh` 是一个用于将 Git 仓库中的特定目录拆分为独立仓库的工具，同时保留完整的提交历史。

### 功能特性
- 📁 **目录拆分**：将指定目录拆分为独立的 Git 仓库
- 📜 **历史保留**：完整保留相关提交历史记录
- 🔧 **前缀调整**：可选地为新仓库添加目录前缀
- 🚀 **自动推送**：自动推送到新的远程仓库

### 使用方法

#### 基本语法
```bash
./repo-split.sh <original_repo_path> <directory_to_split> <new_repo_remote_url> [<new_repo_prefix>]
```

#### 参数说明
- `original_repo_path`：原始仓库的路径
- `directory_to_split`：要拆分的目录名称
- `new_repo_remote_url`：新仓库的远程 URL
- `new_repo_prefix`（可选）：新仓库的目录前缀

#### 使用示例

**1. 基本拆分**
```bash
# 将 apps/utc-react 目录拆分为独立仓库
./repo-split.sh ./ apps/utc-react https://gitee.com/yourname/utc-react.git
```

**2. 带前缀拆分**
```bash
# 拆分并添加前缀目录
./repo-split.sh ./ apps/utc-react https://gitee.com/yourname/utc-react.git new-prefix
```

**3. 完整工作流程**
```bash
# 1. 确保脚本有执行权限
chmod +x repo-split.sh

# 2. 执行拆分操作
./repo-split.sh ./ apps/utc-react https://gitee.com/yourname/utc-react.git

# 3. 验证新仓库
cd /tmp/your-new-clone
git clone https://gitee.com/yourname/utc-react.git
git log --oneline  # 查看提交历史
```

### 工作原理
1. 使用 `git subtree split` 创建包含指定目录历史的临时分支
2. 克隆仓库并使用 `git filter-branch` 过滤相关提交
3. 可选地应用目录前缀重组文件结构
4. 推送到新的远程仓库并清理临时文件

### 注意事项
- ⚠️ 确保新仓库 URL 可访问且有推送权限
- ⚠️ 脚本会创建临时文件，确保有足够的磁盘空间
- ⚠️ 操作不可逆，建议在操作前备份原始仓库
- ⚠️ 需要安装 Git 命令行工具

---
**项目配置在 `local-projects.json` 中**


## AGENTS使用例子
如何实现“根据 AGENTS 生成需求 xxxx”
为了让 Claude 在你说“根据 AGENTS 生成需求 xxxx”时生成符合需求的代码，需确保以下步骤：

AI 工具配置：

确保 Claude 或其他 AI 工具（如 Cursor、Gemini CLI）支持读取 AGENTS.md 文件（OpenSpec 文档提到 Amp、Jules 等工具兼容 AGENTS.md）。
如果 Claude 未自动加载 AGENTS.md，可手动提示：
textClaude, read the AGENTS.md files in the project root and apps/utc-react/, then generate code for demand xxxx based on the RCCA template.



结构化 RCCA 模板：

根目录和子项目的 RCCA 模板已优化，包含明确的 Role、Context、Constraint 和 Action，Claude 可直接解析。
示例提示：
text根据 AGENTS 生成需求：为 utc-react 添加一个用户管理页面，包含搜索和分页功能。
Claude 将：

读取根目录 AGENTS.md 的通用规则（单引号、无分号、zod 校验）。
读取 apps/utc-react/AGENTS.md 的上下文（UmiJS、Ant Design、Less modules）。
根据 Role: UmiJS 页面生成者 生成类型安全的 React 页面代码。