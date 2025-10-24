## Why
当前 UTC 项目缺少用户认证功能，敏感数据无法得到有效保护，需要实现完整的用户登录和权限管理系统。

## What Changes
- 添加用户登录页面和认证组件
- 实现 JWT Token 管理
- 集成权限控制中间件
- 添加用户状态管理 (UmiJS models)
- 更新 API 调用以支持认证头

**BREAKING**: 需要修改现有 API 调用方式，添加认证头

## Impact
- Affected specs: `react-standards` (添加认证相关规范)
- Affected code:
  - `apps/utc-react/src/pages/Login/`
  - `apps/utc-react/src/models/auth.ts`
  - `apps/utc-react/src/services/auth.ts`
  - `apps/utc-react/src/components/AuthGuard/`
  - 现有 API 调用需要添加认证