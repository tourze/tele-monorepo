## 1. 认证组件开发
- [ ] 1.1 创建登录页面组件 `apps/utc-react/src/pages/Login/index.tsx`
- [ ] 1.2 实现登录表单，遵循 `react-standards` 规范
- [ ] 1.3 添加表单验证和错误处理
- [ ] 1.4 使用 `callAPI` 统一调用认证接口

## 2. 状态管理
- [ ] 2.1 创建 auth model `apps/utc-react/src/models/auth.ts`
- [ ] 2.2 实现用户登录状态管理
- [ ] 2.3 添加 JWT Token 存储和刷新逻辑
- [ ] 2.4 集成权限状态管理

## 3. API 服务层
- [ ] 3.1 创建认证服务 `apps/utc-react/src/services/auth.ts`
- [ ] 3.2 实现 login, logout, refreshToken 方法
- [ ] 3.3 更新现有 `callAPI` 支持自动添加认证头
- [ ] 3.4 添加 API 错误处理和 Token 过期处理

## 4. 权限控制
- [ ] 4.1 创建 AuthGuard 组件 `apps/utc-react/src/components/AuthGuard/`
- [ ] 4.2 实现路由级别的权限控制
- [ ] 4.3 添加权限检查 Hooks
- [ ] 4.4 集成现有页面的权限控制

## 5. 测试和验证
- [ ] 5.1 测试登录流程完整性
- [ ] 5.2 验证 Token 过期自动刷新
- [ ] 5.3 测试权限控制功能
- [ ] 5.4 运行 `openspec validate` 确保符合规范