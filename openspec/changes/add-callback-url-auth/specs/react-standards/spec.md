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
- **AND** 当需要用户认证时，API 调用 SHALL 自动传递当前页面 URL 作为 callbackUrl 参数

#### Scenario: 认证回调处理
- **WHEN** 用户需要重新登录
- **THEN** 系统 SHALL 获取当前完整页面 URL（包含 hash 和 query 参数）
- **AND** 系统 SHALL 调用 `/utc/auth` 接口并传递 `callbackUrl` 参数
- **AND** callbackUrl SHALL 进行 URL 编码以确保安全传输
- **AND** 登录成功后系统 SHALL 跳转到指定的 callbackUrl

## ADDED Requirements

### Requirement: 回调 URL 安全规范

开发者 SHALL 确保 callbackUrl 的安全性和正确性。

#### Scenario: URL 安全验证
- **WHEN** 使用 callbackUrl 进行页面跳转
- **THEN** 系统 SHALL 验证 callbackUrl 域名是否在白名单内
- **AND** 系统 SHALL 防止恶意重定向攻击
- **AND** 无效或恶意的 callbackUrl SHALL 被替换为默认页面

#### Scenario: URL 格式处理
- **WHEN** 生成 callbackUrl 参数
- **THEN** 系统 SHALL 正确处理包含 hash 路由的 URL
- **AND** 系统 SHALL 保持所有 query 参数的完整性
- **AND** 系统 SHALL 确保特殊字符正确编码

#### Scenario: 移动端兼容性
- **WHEN** 在移动端环境中生成 callbackUrl
- **THEN** 系统 SHALL 处理移动端特有的 URL 格式差异
- **AND** 系统 SHALL 确保在不同浏览器中的一致性