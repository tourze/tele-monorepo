# VibeShell

基于 Nx 的开发环境，支持从 Gitee 克隆多个项目到 `apps` 目录进行统一管理。

## 项目结构

```
vibe-shell/
├── apps/                          # 存放从 Gitee 克隆的子项目
├── scripts/
│   └── manage-gitee-projects.js   # Gitee 项目管理脚本
├── gitee-projects.json           # Gitee 项目配置文件
├── package.json                   # 项目依赖和脚本
├── nx.json                        # Nx 配置文件
└── README.md                      # 项目说明文档
```

## 快速开始

### 1. 添加 Gitee 项目

```bash
# 添加项目并克隆到 apps 目录
npm run gitee:add <项目名称> <Gitee仓库地址> [分支名]

# 示例：
npm run gitee:add my-app https://gitee.com/username/my-app.git
npm run gitee:add my-app https://gitee.com/username/my-app.git develop
```

### 2. 管理已配置的项目

```bash
# 列出所有配置的项目及其状态
npm run gitee:list

# 克隆所有配置的项目
npm run gitee:clone

# 更新所有项目（如果项目不存在会自动克隆）
npm run gitee:pull

# 同步所有项目（等同于 pull）
npm run gitee:sync

# 移除指定项目
npm run gitee:remove <项目名称>
```

### 3. 配置文件

编辑 `gitee-projects.json` 文件来管理项目配置：

```json
{
  "projects": [
    {
      "name": "example-project",
      "giteeUrl": "https://gitee.com/user/example-project.git",
      "branch": "master",
      "appsDir": true
    }
  ],
  "defaultAppsDir": "apps",
  "defaultBranch": "master"
}
```

## 详细功能说明

### 项目管理命令

- **`gitee:add <name> <url> [branch]`** - 添加新项目到配置并立即克隆
- **`gitee:clone`** - 克隆所有配置的项目到 `apps` 目录
- **`gitee:pull`** - 拉取所有项目的最新更新（如果项目不存在会自动克隆）
- **`gitee:sync`** - 同步所有项目（等同于 pull）
- **`gitee:list`** - 显示所有配置的项目及其状态（✓ 表示已存在，✗ 表示未克隆）
- **`gitee:remove <name>`** - 移除指定项目（从文件系统和配置中删除）

### 脚本直接调用

也可以直接调用管理脚本：

```bash
# 查看帮助
node scripts/manage-gitee-projects.js

# 添加项目
node scripts/manage-gitee-projects.js add my-project https://gitee.com/user/my-project.git

# 其他命令
node scripts/manage-gitee-projects.js clone
node scripts/manage-gitee-projects.js pull
node scripts/manage-gitee-projects.js list
```

## Git 配置

- `apps/` 目录下的内容已被添加到 `.gitignore`，不会提交到仓库
- `apps/.gitkeep` 文件确保 `apps` 目录结构被 Git 跟踪
- 每个子项目保持独立的 Git 仓库和版本控制

## 工作流建议

1. **项目配置** - 将常用的 Gitee 项目添加到 `gitee-projects.json`
2. **团队协作** - 团队成员克隆此 monorepo 后，运行 `npm run gitee:clone` 获取所有项目
3. **定期同步** - 使用 `npm run gitee:sync` 保持项目最新
4. **项目更新** - 在各个子项目目录内正常使用 Git 命令

## 注意事项

- 确保有访问对应 Gitee 仓库的权限
- 建议使用 SSH 密钥以避免频繁输入密码
- 如果 Gitee 仓库是私有的，请配置相应的访问凭据

## 扩展功能

### 手动编辑配置文件

你可以直接编辑 `gitee-projects.json` 来批量添加或修改项目配置：

```json
{
  "projects": [
    {
      "name": "frontend-app",
      "giteeUrl": "https://gitee.com/team/frontend-app.git",
      "branch": "main"
    },
    {
      "name": "backend-api",
      "giteeUrl": "https://gitee.com/team/backend-api.git",
      "branch": "develop"
    }
  ]
}
```

编辑完成后运行 `npm run gitee:clone` 来克隆新添加的项目。

---

✨ **基于 Nx 的开发环境，专为管理多个 Gitee 项目而设计** ✨

[Nx 官方文档](https://nx.dev) | [Gitee 官网](https://gitee.com)