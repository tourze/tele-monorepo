# react-native-shadowsocksr（占位骨架）

> React Native SSR/VPN 原生模块的初始骨架，当前仅提供占位 API，便于集成与后续迁移。

## 安装（工作区）
- 已加入 Yarn workspaces：`packages/react-native-shadowsocksr`
- React Native 自动链接：Android 通过 TurboPackage；iOS 通过 Podspec（尚未提供实现，仅占位）。

## JS API（占位）
```ts
import SSR from 'react-native-shadowsocksr';

await SSR.prepare();            // 触发/检查授权（Android 返回 true 占位）
await SSR.start({ host, port }); // 启动（占位：返回 false）
await SSR.status();              // 查询状态（占位：'UNKNOWN'）
await SSR.stop();                // 停止（占位：返回 true）
```

说明：
- 以上返回值为占位行为，仅保证编译与运行不崩溃。
- 后续将替换为接入 `VpnService`/AIDL/NDK 的真实实现，参见 apps/telescope-react-native/SSR模块化可行性报告.md。

## 目录结构
- `src/`：JS 入口与 TurboModule 声明（codegen）
- `android/`：Android 原生库（Kotlin + TurboPackage）
- `ios/`：Podspec 占位（后续补充源码）

## 计划
- 接入 `ShadowsocksVpnService` 与 AIDL 回调
- 迁移 assets/acl 与预编译 so；支持 `externalNativeBuild(CMake)` 源码构建切换
- JS 层保持跨平台 API：`prepare/start/stop/status`

