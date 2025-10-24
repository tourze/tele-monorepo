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

进入 `apps/` 目录下的具体项目，按照该项目的说明运行：

```bash
# 示例：进入项目并运行
cd apps/your-project-name
npm run dev
# 或
npm start
```

## 提交子仓库更新

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
```

---

**项目配置在 `gitee-projects.json` 中**