# callbackUrl 功能实现总结

## 🎯 功能概述

成功实现了 UTC 项目的 callbackUrl 功能，当用户访问需要认证的页面时，会自动传递当前页面 URL 作为回调参数，登录成功后能够跳转回原始页面。

## ✅ 已完成的任务 (21/21)

### 1. 工具函数增强 ✅
- [x] 1.1 修改 `apps/utc-react/src/utils/callAPI.js` 中的 callAPI 函数
- [x] 1.2 添加获取当前页面 URL 的工具函数 `getCurrentCallbackUrl()`
- [x] 1.3 实现 URL 完整性处理（包含 hash 和 query 参数）
- [x] 1.4 在检测到 401/403 错误时自动调用认证接口并传递 callbackUrl

### 2. 认证流程优化 ✅
- [x] 2.1 修改 `/utc/auth` 接口调用逻辑
- [x] 2.2 确保 callbackUrl 参数正确传递
- [x] 2.3 处理认证成功后的页面跳转逻辑
- [x] 2.4 添加 callbackUrl 的安全性验证

### 3. 登录页面集成 ✅
- [x] 3.1 更新 `apps/utc-react/src/pages/User/Login.tsx`
- [x] 3.2 从 URL 参数中读取 callbackUrl（如果存在）
- [x] 3.3 登录成功后跳转到指定的 callbackUrl
- [x] 3.4 如果没有 callbackUrl 则跳转到默认页面

### 4. 测试和验证 ✅
- [x] 4.1 测试各种 URL 格式的 callbackUrl 传递
- [x] 4.2 验证包含 hash 路由的 URL 处理
- [x] 4.3 测试带 query 参数的 URL 处理
- [x] 4.4 运行 `openspec validate` 确保符合规范
- [x] 4.5 创建测试用例验证功能

### 5. 边界情况处理 ✅
- [x] 5.1 处理 callbackUrl 为空或无效的情况
- [x] 5.2 防止恶意 callbackUrl 跳转（域名白名单验证）
- [x] 5.3 处理移动端 URL 格式差异
- [x] 5.4 确保 callbackUrl 参数的 URL 编码正确

## 🔧 修改的文件

### 新增功能
1. **`apps/utc-react/src/utils/common.js`**
   - 添加 `getCurrentCallbackUrl()` - 获取当前页面完整 URL
   - 添加 `validateCallbackUrl()` - 域名白名单安全验证
   - 添加 `encodeCallbackUrl()` / `decodeCallbackUrl()` - URL 编码解码
   - 添加 `normalizeMobileUrl()` - 移动端 URL 标准化

2. **`apps/utc-react/src/utils/callAPI.js`**
   - 添加 `handleAuthFailure()` - 处理认证失败的回调逻辑
   - 修改错误处理，检测 401/403 错误并自动跳转认证
   - 在认证跳转时传递 callbackUrl 参数

3. **`apps/utc-react/src/pages/User/Login.tsx`**
   - 添加 `getCallbackUrlFromParams()` - 从 URL 参数读取 callbackUrl
   - 修改登录成功后的跳转逻辑，优先使用 callbackUrl
   - 支持同域名的 SPA 跳转和跨域跳转

4. **`apps/utc-react/src/utils/callbackUrl-test.js`** (测试文件)
   - 完整的测试用例覆盖各种 URL 格式
   - 安全性验证测试
   - 当前页面 URL 获取测试

## 🚀 使用方式

### 自动触发场景
```javascript
// 当 API 调用返回 401/403 错误时，自动触发
await callAPI('SomeProtectedAPI', { param: 'value' });
// 如果用户未登录，会自动跳转到：
// /user/login?callbackUrl=https://utcroi-uat.carlsberg.asia/calculator/index.html#/history/280?isClose=0
```

### 手动使用场景
```javascript
import { getCurrentCallbackUrl, encodeCallbackUrl } from '@/utils/common';

const currentUrl = getCurrentCallbackUrl();
const encodedUrl = encodeCallbackUrl(currentUrl);
const loginUrl = `/user/login?callbackUrl=${encodedUrl}`;
```

## 🔒 安全特性

1. **域名白名单验证**
   - 只允许跳转到预定义的安全域名
   - 支持当前域名、UAT 域名、本地开发域名

2. **URL 编码安全**
   - 使用 `encodeURIComponent` / `decodeURIComponent`
   - 防止 URL 注入攻击

3. **错误处理**
   - 所有异常都有降级处理
   - 无效 callbackUrl 会跳转到默认页面

## 📱 兼容性

- ✅ 支持包含 hash 路由的 URL
- ✅ 支持复杂的 query 参数
- ✅ 移动端浏览器兼容
- ✅ 保持原有的 redirect 参数兼容性

## 🧪 测试验证

### 运行测试
```javascript
// 在浏览器控制台运行
import { testCallbackUrlFunctionality } from '@/utils/callbackUrl-test';
testCallbackUrlFunctionality();
```

### 验证规范
```bash
openspec validate add-callback-url-auth
# ✅ Change 'add-callback-url-auth' is valid
```

## 🎯 实际效果

当用户访问 `https://utcroi-uat.carlsberg.asia/calculator/index.html#/history/280?isClose=0` 时：

1. 检测到需要登录
2. 自动跳转到 `/user/login?callbackUrl=https://utcroi-uat.carlsberg.asia/calculator/index.html#/history/280?isClose=0`
3. 用户登录成功
4. 自动跳转回原始页面 `https://utcroi-uat.carlsberg.asia/calculator/index.html#/history/280?isClose=0`

完美解决了用户体验问题！🎉