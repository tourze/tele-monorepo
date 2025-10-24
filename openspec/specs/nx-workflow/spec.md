# Nx 工作区流程规范

## Purpose

定义 Vibe-Shell 项目中 Nx Monorepo 的使用流程和最佳实践，确保多项目管理的高效性。

## Requirements

### Requirement: 项目结构管理规范

开发者 SHALL 遵循统一的 Nx 工作区项目组织结构标准。

#### Scenario: 子项目创建标准
- **WHEN** 添加新的子项目
- **THEN** 开发者 SHALL 使用 `npx nx generate @nx/react:app` 命令
- **AND** 项目命名 SHALL 使用 kebab-case 格式
- **AND** 开发者 SHALL 将项目放置在 `apps/` 目录下

### Requirement: 依赖管理规范

开发者 SHALL 遵循明确的工作区依赖管理策略。

#### Scenario: 根级依赖管理
- **WHEN** 安装新的依赖
- **THEN** 开发者 SHALL 评估是否为多个项目所需
- **AND** 多项目共享的依赖 SHALL 安装在根级
- **AND** 项目特定依赖 SHALL 安装在对应项目目录

### Requirement: 构建和执行流程规范

开发者 SHALL 支持项目依赖关系的构建流程。

#### Scenario: 依赖构建配置
- **WHEN** 构建有依赖关系的项目
- **THEN** 开发者 SHALL 使用 `dependsOn` 配置
- **AND** 构建顺序 SHALL 自动处理
- **AND** 共享依赖 SHALL 优先构建

### Requirement: 缓存和性能规范

开发者 SHALL 充分利用 Nx 的缓存机制来提升性能。

#### Scenario: 任务缓存配置
- **WHEN** 配置任务缓存
- **THEN** 开发者 SHALL 在 nx.json 中定义 inputs 和 outputs
- **AND** SHALL 包含所有影响构建的文件
- **AND** SHALL 合理设置缓存策略

### Requirement: OpenSpec 集成规范

开发者 SHALL 将 OpenSpec 与 Nx 工作流深度集成。

#### Scenario: 规范验证集成
- **WHEN** 执行构建任务
- **THEN** 构建 SHALL 自动先执行 OpenSpec 验证
- **AND** 验证失败时 SHALL 阻止构建继续
- **AND** 共享规范变更 SHALL 影响所有项目

### Requirement: 开发环境管理规范

开发者 SHALL 支持多项目同时开发的环境配置。

#### Scenario: 开发服务器启动
- **WHEN** 同时开发多个项目
- **THEN** 开发者 SHALL 使用不同端口启动开发服务器
- **AND** utc-react SHALL 使用端口 8007
- **AND** 开发者 SHALL 确保端口不冲突

### Requirement: 代码质量检查规范

开发者 SHALL 在工作区层面统一执行代码质量检查。

#### Scenario: 批量代码检查
- **WHEN** 检查代码质量
- **THEN** 开发者 SHALL 使用 `npx nx run-many --target=lint`
- **AND** SHALL 统一所有项目的代码规范
- **AND** SHALL 支持并行执行检查

### Requirement: 发布和部署规范

开发者 SHALL 考虑多项目协调的部署流程。

#### Scenario: 独立部署
- **WHEN** 部署单个项目
- **THEN** 开发者 SHALL 只构建和部署特定项目
- **AND** SHALL 考虑项目的依赖关系
- **AND** SHALL 验证共享服务的兼容性

### Requirement: 团队协作规范

团队成员 SHALL 遵循明确的多人协作流程。

#### Scenario: 任务分配
- **WHEN** 分配开发任务
- **THEN** 团队 SHALL 明确任务涉及的子项目
- **AND** SHALL 考虑项目间的依赖关系
- **AND** SHALL 协调跨项目的开发时间

### Requirement: 监控和调试规范

开发者 SHALL 提供有效的监控和调试手段。

#### Scenario: 项目依赖图分析
- **WHEN** 分析项目依赖关系
- **THEN** 开发者 SHALL 使用 `npx nx graph` 查看依赖图
- **AND** SHALL 识别循环依赖问题
- **AND** SHALL 优化项目结构