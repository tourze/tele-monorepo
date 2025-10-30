# VibeShell

VibeShell 是一个使用 Yarn Workspaces 管理的多项目仓库，当前聚焦于微信小程序项目。通过统一的依赖与脚本配置，可快速同步、开发与构建多个业务仓库。

## 快速上手

1. 确认已安装 Yarn（建议使用 1.22 及以上版本）：
   ```bash
   yarn --version
   ```
2. 在仓库根目录安装依赖：
   ```bash
   yarn install
   ```
3. 查看已经接入的工作区项目：
   ```bash
   yarn list-projects
   ```

## 常用脚本

- `yarn clone-project <名称> <仓库地址>`：克隆新项目到 `apps/<名称>` 并记录到 `local-projects.json`
- `yarn update-project <名称>`：在 `apps/<名称>` 内执行 `git pull`
- `yarn sync-project`：根据 `local-projects.json` 批量克隆或更新项目
- `yarn dev:tkp-pp`：启动 `tkp-pp-wmp` 的开发构建
- `yarn dev:tkp-cg`：打印指引，提醒通过微信开发者工具打开 `apps/tkp-cg-wmp`
- `yarn build:tkp-pp`：打包 `tkp-pp-wmp`
- `yarn build:tkp-cg`：打印指引，提醒在微信开发者工具内完成构建
- `yarn openspec:validate`：运行 OpenSpec 校验脚本，检查工作区与规范文件
- `yarn reinstall`：清理各级 `node_modules` 与锁文件后重新安装依赖

⚠️ 仓库内所有依赖操作请使用 `yarn`，避免混用 `npm` 或 `pnpm`。

## Yarn Workspaces 常见命令

- `yarn workspaces info`：查看工作区拓扑结构与依赖信息（参考 Yarn Classic 官方文档）
- `yarn workspaces run <脚本>`：一次性在所有工作区执行同名脚本，例如 `yarn workspaces run lint`
- `yarn workspace <包名> run <脚本>`：在指定工作区内执行脚本，例如 `yarn workspace tkp-pp-wmp run build`
- `yarn workspace <包名> add <依赖>`：向某个工作区安装依赖，并自动在根目录提升共享

> 如果未来升级到 Yarn Berry（v2+），可结合 `yarn workspaces list`、`yarn workspaces foreach` 等新指令；当前仓库基于 Yarn 1.x。

## 目录结构

```
.
├── apps/                  # 微信小程序项目（Yarn 工作区之一）
├── packages/              # 预留的共享包与工具集合
├── openspec/              # 项目治理相关的规范文件
├── scripts/               # 仓库管理脚本
├── README.md              # 使用说明
└── package.json           # Yarn monorepo 配置（workspaces）
```

## OpenSpec 验证

执行 `yarn openspec:validate` 会检查：

1. `openspec/` 目录结构是否完整；
2. `apps/*` 项目中是否存在 `.openspec` 配置；
3. 根目录 `package.json` 的 Yarn Workspaces 配置是否规范；
4. 环境中是否可用 OpenSpec CLI（如未安装，会给出提示）。

## 仓库拆分工具

仓库内附带 `repo-split.sh`，可在保留提交历史的前提下将某个子目录拆分为独立仓库：

```bash
# 将 apps/utc-react 目录拆分并推送到新的远程仓库
./repo-split.sh ./ apps/utc-react https://gitee.com/yourname/utc-react.git
```

> 提示：拆分操作需要 Git 命令行环境，执行前请确认磁盘空间充足并完成源仓库备份。

## AI 协作提示

确保常用 AI 工具（如 Claude、Cursor、Gemini CLI）可以读取仓库中的 `AGENTS.md` 和 OpenSpec 相关文件，在提出需求或让 AI 协助开发时效果更佳。
