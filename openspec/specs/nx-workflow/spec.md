# Nx 工作区流程规范

## Purpose

定义 Vibe-Shell 项目中 Nx Monorepo 的使用流程和最佳实践，确保多项目管理的高效性。

## Requirements

### Requirement: 项目结构管理

Nx 工作区的项目必须有统一的组织结构。

#### Scenario: 子项目创建
- **WHEN** 添加新的子项目
- **THEN** 使用 `npx nx generate @nx/react:app` 命令
- **AND** 项目命名使用 kebab-case
- **AND** 将项目放置在 `apps/` 目录下

#### Scenario: 项目配置文件
- **WHEN** 配置子项目
- **THEN** 在项目根目录创建 `project.json`
- **AND** 定义 build、serve、test 等目标
- **AND** 继承 nx.json 中的 targetDefaults

```json
{
  "name": "new-project",
  "$schema": "../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "apps/new-project/src",
  "projectType": "application",
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npm run build",
        "cwd": "apps/new-project"
      },
      "dependsOn": ["openspec-validate"]
    }
  }
}
```

### Requirement: 依赖管理

工作区依赖必须有明确的管理策略。

#### Scenario: 根级依赖管理
- **WHEN** 安装新的依赖
- **THEN** 评估是否为多个项目所需
- **AND** 多项目共享的依赖安装在根级
- **AND** 项目特定依赖安装在对应项目目录

#### Scenario: 依赖版本同步
- **WHEN** 更新 React 相关依赖
- **THEN** 确保所有项目的 React 版本兼容
- **AND** 考虑使用 npm workspace 或 pnpm workspace
- **AND** 定期检查和更新依赖版本

### Requirement: 构建和执行流程

构建流程必须支持项目的依赖关系。

#### Scenario: 依赖构建
- **WHEN** 构建有依赖关系的项目
- **THEN** 使用 `dependsOn` 配置
- **AND** 构建顺序自动处理
- **AND** 共享依赖优先构建

```json
{
  "targets": {
    "build": {
      "dependsOn": ["^build", "openspec-validate"],
      "inputs": ["production", "^production", "sharedGlobals"]
    }
  }
}
```

#### Scenario: 批量操作
- **WHEN** 操作多个项目
- **THEN** 使用 `npx nx run-many` 命令
- **AND** 支持并行执行以提高效率
- **AND** 可选择特定项目或项目类型

```bash
# 构建所有项目
npx nx run-many --target=build --all

# 构建特定项目
npx nx run-many --target=build --projects=project1,project2

# 并行执行
npx nx run-many --target=test --all --parallel
```

### Requirement: 缓存和性能

必须充分利用 Nx 的缓存机制来提升性能。

#### Scenario: 任务缓存配置
- **WHEN** 配置任务缓存
- **THEN** 在 nx.json 中定义 inputs 和 outputs
- **AND** 包含所有影响构建的文件
- **AND** 合理设置缓存策略

```json
{
  "targetDefaults": {
    "build": {
      "inputs": ["production", "^production", "sharedGlobals"],
      "outputs": ["{projectRoot}/dist", "{projectRoot}/build"]
    }
  }
}
```

#### Scenario: 缓存管理
- **WHEN** 遇到缓存问题
- **THEN** 使用 `npx nx reset` 清除缓存
- **AND** 检查 inputs 配置是否正确
- **AND** 考虑排除不必要的缓存文件

### Requirement: OpenSpec 集成

OpenSpec 必须与 Nx 工作流深度集成。

#### Scenario: 规范验证集成
- **WHEN** 执行构建任务
- **THEN** 自动先执行 OpenSpec 验证
- **AND** 验证失败时阻止构建继续
- **AND** 共享规范变更时影响所有项目

#### Scenario: 共享规范管理
- **WHEN** 修改共享规范
- **THEN** 在 openspec/ 目录中统一管理
- **AND** 使用 namedInputs 配置共享输入
- **AND** 确保所有项目都能访问最新规范

```json
{
  "namedInputs": {
    "sharedGlobals": [
      "{workspaceRoot}/openspec/AGENTS.md",
      "{workspaceRoot}/openspec/project.md",
      "{workspaceRoot}/openspec/specs/**/*",
      "{workspaceRoot}/openspec/changes/**/*"
    ]
  }
}
```

### Requirement: 开发环境管理

开发环境必须支持多项目同时开发。

#### Scenario: 开发服务器启动
- **WHEN** 同时开发多个项目
- **THEN** 使用不同端口启动开发服务器
- **AND** utc-react 使用端口 8007
- **AND** 确保端口不冲突

#### Scenario: 热重载配置
- **WHEN** 修改代码
- **THEN** 相关项目自动热重载
- **AND** 共享代码变更影响所有依赖项目
- **AND** 跨项目依赖更新时正确处理

### Requirement: 代码质量检查

代码质量检查必须在工作区层面统一执行。

#### Scenario: 批量代码检查
- **WHEN** 检查代码质量
- **THEN** 使用 `npx nx run-many --target=lint`
- **AND** 统一所有项目的代码规范
- **AND** 支持并行执行检查

#### Scenario: 格式化统一
- **WHEN** 格式化代码
- **THEN** 所有项目使用相同的 Prettier 配置
- **AND** 统一缩进、引号、换行等格式规则
- **AND** 在 CI/CD 中自动检查格式

### Requirement: 发布和部署

部署流程必须考虑多项目的协调。

#### Scenario: 独立部署
- **WHEN** 部署单个项目
- **THEN** 只构建和部署特定项目
- **AND** 考虑项目的依赖关系
- **AND** 验证共享服务的兼容性

#### Scenario: 联合部署
- **WHEN** 部署多个相关项目
- **THEN** 按依赖顺序进行部署
- **AND** 确保服务间接口兼容
- **AND** 提供回滚机制

### Requirement: 团队协作

多人协作时必须有明确的流程规范。

#### Scenario: 任务分配
- **WHEN** 分配开发任务
- **THEN** 明确任务涉及的子项目
- **AND** 考虑项目间的依赖关系
- **AND** 协调跨项目的开发时间

#### Scenario: 代码审查
- **WHEN** 审查跨项目代码变更
- **THEN** 检查对其他项目的影响
- **AND** 验证共享规范的遵循情况
- **AND** 确保构建和测试通过

### Requirement: 监控和调试

必须提供有效的监控和调试手段。

#### Scenario: 项目依赖图
- **WHEN** 分析项目依赖关系
- **THEN** 使用 `npx nx graph` 查看依赖图
- **AND** 识别循环依赖问题
- **AND** 优化项目结构

#### Scenario: 性能监控
- **WHEN** 监控构建性能
- **THEN** 使用 `npx nx show project` 查看项目信息
- **AND** 分析构建时间和缓存命中率
- **AND** 识别性能瓶颈