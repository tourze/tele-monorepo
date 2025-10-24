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

### 1. 配置项目

编辑 `gitee-projects.json` 文件来添加需要管理的项目：

```json
{
  "projects": [
    {
      "name": "seven-fish-customer-service",
      "giteeUrl": "https://gitee.com/umworks/seven-fish-customer-service.git",
      "branch": "master",
      "appsDir": true
    }
  ],
  "defaultAppsDir": "apps",
  "defaultBranch": "master"
}
```

**配置说明：**
- `name`: 项目名称，将作为 apps 目录下的子目录名
- `giteeUrl`: Gitee 仓库地址
- `branch`: 要克隆的分支（可选，默认为 master）
- `appsDir`: 是否放在 apps 目录下（通常为 true）

### 2. 克隆和管理项目

```bash
# 克隆所有配置的项目
npm run gitee:clone

# 列出所有配置的项目及其状态
npm run gitee:list

# 更新所有项目（如果项目不存在会自动克隆）
npm run gitee:pull

# 同步所有项目（等同于 pull）
npm run gitee:sync
```

**clone 命令说明：**
- 读取 `gitee-projects.json` 配置文件
- 将所有配置的项目克隆到 `apps/` 目录下
- 如果项目已存在，则跳过克隆
- 支持指定分支克隆（默认为 master 分支）

### 3. 手动移除项目

如需移除项目，请手动：
1. 删除 `apps/` 目录下对应的项目文件夹
2. 从 `gitee-projects.json` 中移除相应的配置项

## 详细功能说明

### 项目管理命令

- **`gitee:clone`** - 克隆所有配置的项目到 `apps` 目录
- **`gitee:pull`** - 拉取所有项目的最新更新（如果项目不存在会自动克隆）
- **`gitee:sync`** - 同步所有项目（等同于 pull）
- **`gitee:list`** - 显示所有配置的项目及其状态（✓ 表示已存在，✗ 表示未克隆）

### 脚本直接调用

也可以直接调用管理脚本：

```bash
# 查看帮助
node scripts/manage-gitee-projects.js

# 克隆所有配置的项目
node scripts/manage-gitee-projects.js clone

# 拉取最新代码
node scripts/manage-gitee-projects.js pull

# 同步项目
node scripts/manage-gitee-projects.js sync

# 列出项目状态
node scripts/manage-gitee-projects.js list
```

**使用示例：**

```bash
# 1. 编辑 gitee-projects.json 添加项目配置
# 2. 运行克隆命令
npm run gitee:clone

# 或者直接调用脚本
node scripts/manage-gitee-projects.js clone
```

**执行结果：**
- 项目将被克隆到 `apps/项目名称/` 目录
- 保持完整的 Git 历史和版本控制
- 可以独立在项目目录内进行 Git 操作

## Git 配置

- `apps/` 目录下的内容已被添加到 `.gitignore`，不会提交到仓库
- `apps/.gitkeep` 文件确保 `apps` 目录结构被 Git 跟踪
- 每个子项目保持独立的 Git 仓库和版本控制

## 工作流建议

1. **项目配置** - 直接编辑 `gitee-projects.json` 文件添加需要管理的项目
2. **团队协作** - 团队成员克隆此 monorepo 后，运行 `npm run gitee:clone` 获取所有项目
3. **定期同步** - 使用 `npm run gitee:sync` 保持项目最新
4. **项目更新** - 在各个子项目目录内正常使用 Git 命令
5. **移除项目** - 手动删除项目文件夹并编辑配置文件移除相应配置

## 注意事项

- 确保有访问对应 Gitee 仓库的权限
- 建议使用 SSH 密钥以避免频繁输入密码
- 如果 Gitee 仓库是私有的，请配置相应的访问凭据

### 批量配置项目

你可以直接编辑 `gitee-projects.json` 来批量添加或修改项目配置：

```json
{
  "projects": [
    {
      "name": "frontend-app",
      "giteeUrl": "https://gitee.com/team/frontend-app.git",
      "branch": "main",
      "appsDir": true
    },
    {
      "name": "backend-api",
      "giteeUrl": "https://gitee.com/team/backend-api.git",
      "branch": "develop",
      "appsDir": true
    }
  ],
  "defaultAppsDir": "apps",
  "defaultBranch": "master"
}
```

编辑完成后运行 `npm run gitee:clone` 来克隆新添加的项目。

---

✨ **基于 Nx 的开发环境，专为管理多个 Gitee 项目而设计** ✨

[Nx 官方文档](https://nx.dev) | [Gitee 官网](https://gitee.com)