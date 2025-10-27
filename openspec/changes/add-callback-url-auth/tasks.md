## 1. 工具函数增强
- [ ] 1.1 修改 `apps/utc-react/src/services/common.js` 中的 `callAPI` 函数
- [ ] 1.2 添加获取当前页面 URL 的工具函数 `getCurrentCallbackUrl()`
- [ ] 1.3 实现 URL 完整性处理（包含 hash 和 query 参数）
- [ ] 1.4 在检测到 401/403 错误时自动调用认证接口并传递 callbackUrl

## 2. 认证流程优化
- [ ] 2.1 修改 `/utc/auth` 接口调用逻辑
- [ ] 2.2 确保 callbackUrl 参数正确传递
- [ ] 2.3 处理认证成功后的页面跳转逻辑
- [ ] 2.4 添加 callbackUrl 的安全性验证

## 3. 登录页面集成
- [ ] 3.1 更新 `apps/utc-react/src/pages/Login/index.tsx`
- [ ] 3.2 从 URL 参数中读取 callbackUrl（如果存在）
- [ ] 3.3 登录成功后跳转到指定的 callbackUrl
- [ ] 3.4 如果没有 callbackUrl 则跳转到默认页面

## 4. 测试和验证
- [ ] 4.1 测试各种 URL 格式的 callbackUrl 传递
- [ ] 4.2 验证包含 hash 路由的 URL 处理
- [ ] 4.3 测试带 query 参数的 URL 处理
- [ ] 4.4 运行 `openspec validate` 确保符合规范
- [ ] 4.5 在 UAT 环境测试完整的登录回调流程

## 5. 边界情况处理
- [ ] 5.1 处理 callbackUrl 为空或无效的情况
- [ ] 5.2 防止恶意 callbackUrl 跳转（域名白名单验证）
- [ ] 5.3 处理移动端 URL 格式差异
- [ ] 5.4 确保 callbackUrl 参数的 URL 编码正确