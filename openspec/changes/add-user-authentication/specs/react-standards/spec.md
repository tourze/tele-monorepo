## ADDED Requirements

### Requirement: 用户认证组件规范

开发者 SHALL 遵循统一的用户认证组件开发标准。

#### Scenario: 登录组件开发
- **WHEN** 创建用户登录功能
- **THEN** 开发者 SHALL 使用函数组件 + Hooks 模式
- **AND** 组件 SHALL 遵循 `react-standards` 中的所有现有规范
- **AND** 登录表单 SHALL 支持表单验证和错误处理

#### Scenario: 认证状态管理
- **WHEN** 实现用户认证状态管理
- **THEN** 开发者 SHALL 使用 UmiJS model 系统
- **AND** SHALL 在 `src/models/auth.ts` 中管理认证状态
- **AND** JWT Token SHALL 安全存储在 localStorage 中

#### Scenario: API 认证集成
- **WHEN** 进行需要认证的 API 调用
- **THEN** 开发者 SHALL 使用 `callAPI` 的认证模式
- **AND** API 调用 SHALL 自动添加 Authorization 头
- **AND** Token 过期时 SHALL 自动刷新或重定向登录

### Requirement: 权限控制规范

应用 SHALL 实现基于角色的权限控制机制。

#### Scenario: 路由权限保护
- **WHEN** 用户访问受保护的页面
- **THEN** 系统 SHALL 检查用户认证状态
- **AND** 未认证用户 SHALL 被重定向到登录页面
- **AND** 权限不足用户 SHALL 显示友好的无权限提示

## MODIFIED Requirements

### Requirement: API 通信规范

开发者 SHALL 使用统一的 API 调用模式进行后端通信。

#### Scenario: 统一 API 调用 (utc-react)
- **WHEN** 进行后端 API 调用
- **THEN** 开发者 SHALL 使用 `callAPI` 工具函数
- **AND** 所有调用 SHALL 遵循 JSON-RPC 格式
- **AND** 开发者 SHALL 在 services 目录中创建专门的 API 函数
- **AND** 需要认证的调用 SHALL 自动添加 JWT Token 到请求头
- **AND** Token 失效时 SHALL 自动处理刷新逻辑或跳转登录