# VibeShell

基于 Nx 的开发环境，用于管理多个项目。

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
npm run sync-project

# 直接克隆指定仓库到apps目录
npm run sync-project https://gitee.com/umworks/utc-react.git
```

## 运行项目

在根目录安装依赖后，应优先通过 Nx 命令管理所有子项目：

- `nx graph`
  查看项目依赖图，确认目标项目名称。
- `nx serve <project>`
  启动指定项目的开发服务器。
- `nx build <project>`
  构建指定项目产物。
- `nx test <project>`
  运行指定项目的测试任务。
- `nx run-many --target=serve --projects=<proj-a>,<proj-b>`
  同时启动多个项目（根据需要调整目标与项目列表）。

⚠️ **注意**：统一使用根目录的 `npm install` 或 `yarn install` 安装依赖，避免使用 pnpm 以免导致模块解析异常。

## Nx 插件命令参考

### React（@nx/react）

- `nx add @nx/react`
  在现有工作区安装 React 插件。
- `nx g @nx/react:app apps/<app-name>`
  创建 React 应用，可选 `--bundler=webpack|vite`。
- `nx g @nx/react:lib libs/<lib-name>`
  生成 React 库，可搭配 `--bundler=rollup|vite`、`--publishable`、`--importPath=@scope/<lib-name>`。
- `nx g @nx/react:component libs/<lib>/src/lib/<component-name>`
  在指定库中生成组件，支持 `--export` 自动导出。
- `nx g @nx/react:hook libs/<lib>/src/lib/<hook-name>`
  快速创建共享 Hook。
- `nx test <project-name>` / `nx e2e <e2e-project>` / `nx build <project-name>`
  执行单测、端到端测试与构建。
- `npx http-server dist/apps/<app-name>`
  预览构建产物。

### Storybook（@nx/storybook）

- `nx add @nx/storybook`
  向工作区添加 Storybook 插件。
- `nx g @nx/react:storybook-configuration <project-name>`
  为 React 项目生成 Storybook 配置，其他框架可替换生成器前缀。
- `nx storybook <project-name>`
  启动 Storybook 开发服务。
- `nx build-storybook <project-name>`
  构建静态 Storybook 站点。
- `nx test-storybook <project-name>`
  运行 Storybook 测试流程。

### Webpack（@nx/webpack）

- `npx create-nx-workspace@latest --preset=react-standalone --bundler=webpack`
  初始化独立 React（Webpack）项目。
- `npx create-nx-workspace@latest --preset=react-monorepo --bundler=webpack`
  初始化 React Monorepo（Webpack）。
- `nx add @nx/webpack`
  为现有工作区启用 Webpack 集成。
- `nx g @nx/react:app apps/<app-name> --bundler=webpack`
  创建使用 Webpack 构建的 React 应用。
- `nx g @nx/node:app apps/<app-name> --bundler=webpack`
  创建使用 Webpack 的 Node 应用。
- `nx g @nx/web:app apps/<app-name> --bundler=webpack`
  创建使用 Webpack 的 Web 应用。

### ESLint（@nx/eslint）

- `nx add @nx/eslint`
  安装 ESLint 插件与默认任务。
- `nx lint <project-name>`
  运行指定项目的 ESLint 检查。

### React Native（@nx/react-native）

- `npx create-nx-workspace@latest <workspace-name> --preset=react-native --appName=<app-name>`
  使用 React Native 预设初始化工作区。
- `nx add @nx/react-native` / `npm add -D @nx/react-native`
  在工作区中安装 React Native 插件。
- `nx g @nx/react-native:app apps/<app-name>`
  生成新的 React Native 应用。
- `nx g @nx/react-native:lib libs/<lib-name>`
  创建共享库。
- `nx g @nx/react-native:component <component-path> --export`
  创建组件并同步导出。
- `nx start <app-name>` / `nx run-ios <app-name>` / `nx run-android <app-name>`
  启动 Metro 或直接运行 iOS、Android。
- `nx build-ios <app-name> [--buildFolder=./build]` / `nx build-android <app-name>`
  打包移动端产物。
- `nx generate @nx/react-native:upgrade-native apps/<app-name>`
  升级原生工程依赖。

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

#### 示例 1：基本拆分

```bash
# 将 apps/utc-react 目录拆分为独立仓库
./repo-split.sh ./ apps/utc-react https://gitee.com/yourname/utc-react.git
```

#### 示例 2：带前缀拆分

```bash
# 拆分并添加前缀目录
./repo-split.sh ./ apps/utc-react https://gitee.com/yourname/utc-react.git new-prefix
```

#### 示例 3：完整工作流程

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

如何实现“根据 AGENTS 生成需求 xxxx”？为了让 Claude 在你说这句话时生成符合需求的代码，需确保以下步骤：

### AI 工具配置

- 确保 Claude 或其他 AI 工具（如 Cursor、Gemini CLI）支持读取 `AGENTS.md` 文件。
  OpenSpec 文档提到 Amp、Jules 等工具兼容 `AGENTS.md`。
- 如果 Claude 未自动加载 `AGENTS.md`，可手动提示：

  ```text
  textClaude, read the AGENTS.md files in the project root and apps/utc-react/,
  then generate code for demand xxxx based on the RCCA template.
  ```

### 结构化 RCCA 模板

- 根目录和子项目的 RCCA 模板已优化，包含明确的 Role、Context、Constraint 和 Action，Claude 可直接解析。
- 示例提示：

  ```text
  text根据 AGENTS 生成需求：为 utc-react 添加一个用户管理页面，包含搜索和分页功能。
  ```

Claude 将：

1. 读取根目录 `AGENTS.md` 的通用规则（单引号、无分号、zod 校验）。
2. 读取 `apps/utc-react/AGENTS.md` 的上下文（UmiJS、Ant Design、Less modules）。
3. 根据 `Role: UmiJS 页面生成者` 生成类型安全的 React 页面代码。
