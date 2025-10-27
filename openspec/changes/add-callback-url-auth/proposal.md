## Why
当前 UTC 项目在用户需要登录时，登录成功后无法跳转回原始请求页面，用户体验较差。需要传递 callbackUrl 参数让登录后能够返回到用户原本想访问的页面。

## What Changes
- 修改 API 调用逻辑，在调用 `/utc/auth` 时自动传递当前页面 URL 作为 callbackUrl 参数
- 更新 `callAPI` 工具函数，支持自动检测登录需求并传递回调地址
- 确保认证成功后能够跳转回 callbackUrl 指定的页面
- 处理各种 URL 格式（包含 hash、query 参数等）

## Impact
- Affected specs: `react-standards` (API 通信规范)
- Affected code:
  - `apps/utc-react/src/services/common.js` (callAPI 函数)
  - `apps/utc-react/src/pages/Login/index.tsx` (登录页面)
  - 认证相关的 API 调用逻辑