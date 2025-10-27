# OpenSpec 高级指南

## 🤖 AI 集成和 Slash Commands

**Cursor/Claude 等编辑器支持**:
```bash
# 在编辑器中使用 slash commands
/openspec:proposal              # 快速创建提案
/openspec:validate              # 验证当前变更
/openspec:show <spec>           # 查看规范
/openspec:archive <change>      # 归档提案
```

**AI 工作流**:
- AI会自动读取 `openspec/AGENTS.md` 中的工作流指导
- 使用具体的规范条款约束AI行为
- 通过提案机制确保AI不偏离规范

## 🔄 Monorepo 跨项目变更指导

**单个项目变更**:
```bash
# 针对utc-react项目的变更
mkdir -p openspec/changes/utc-react/功能名称
```

**跨多个项目变更**:
```bash
# 方式1: 创建工作区级别提案，在proposal.md中列出所有影响的项目
mkdir -p openspec/changes/跨项目功能名称
# 在proposal.md中明确列出：
# Affected projects: utc-react, seven-fish-customer-service

# 方式2: 为每个项目创建单独的提案
mkdir -p openspec/changes/utc-react/功能名称
mkdir -p openspec/changes/seven-fish-customer-service/功能名称
# 确保提案间有明确的依赖关系
```

**共享组件/库变更**:
```bash
# 针对共享库的变更，直接在workshop级别创建提案
mkdir -p openspec/changes/shared-auth-system
# 在多个项目的specs中创建相应的delta文件
```

## 🤖 维护 AGENTS.md

`openspec/AGENTS.md` 文件定义了AI助手的工作流程和行为指导：

**重要**:
- 定期维护 `openspec/AGENTS.md` 以指导AI工作流
- 在AGENTS.md中定义项目特定的AI约束和行为规范
- 确保AI在开发过程中严格按照OpenSpec规范执行

**AGENTS.md 典型内容**:
- AI工作流程指导
- 项目特定的编码约束
- 规范引用和执行顺序
- 错误处理和验证要求

## 🔄 Git 集成最佳实践

**Git 工作流建议**:
```bash
# 提交规范和归档的提案
git add openspec/specs/ openspec/archive/
git commit -m "docs: update OpenSpec specifications and archive completed changes"

# changes/ 目录为临时工作区，不提交到版本控制
echo "openspec/changes/" >> .gitignore
```

**推荐的 .gitignore 配置**:
```gitignore
# OpenSpec 临时文件
openspec/changes/
!openspec/changes/.gitkeep

# 保留规范和归档
!openspec/specs/
!openspec/archive/
!openspec/AGENTS.md
!openspec/project.md
```

**分支管理**:
- `main`: 稳定的规范和归档提案
- `feature/*`: 开发中的提案 (changes/ 目录)
- 合并feature分支前先归档提案到 archive/

**提交规范**:
```bash
# 提案创建阶段 (可选提交)
git commit -m "feat: add proposal for user authentication system"

# 提案归档后 (必须提交)
git commit -m "docs: archive user authentication proposal and update specs"
```

## 🛠️ 完整 CLI 命令参考

**基础命令**:
```bash
openspec init                    # 初始化OpenSpec项目结构
openspec list --specs           # 列出所有规范
openspec list --changes         # 列出所有提案
openspec show react-standards   # 查看特定规范
openspec view                   # 打开仪表盘视图
```

**提案管理**:
```bash
openspec change create <name>   # 创建新提案
openspec change list            # 列出所有提案
openspec change show <name>     # 查看提案详情
openspec validate <change>      # 验证提案
openspec archive <change> --yes # 归档完成的提案
```

**规范管理**:
```bash
openspec spec show <name>       # 查看规范
openspec spec validate <name>   # 验证规范
openspec spec list              # 列出所有规范
```

**批量操作**:
```bash
openspec validate --all         # 验证所有提案和规范
openspec archive --completed   # 归档所有已完成提案
```