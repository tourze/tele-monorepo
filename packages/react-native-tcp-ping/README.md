# react-native-tcp-ping

一个简单的 React Native TCP Ping 模块（含 Android/iOS 原生实现）。

- Android：Kotlin 原生以 Socket 直连方式多次测速，返回成功样本的平均时延（毫秒）。
- iOS：Objective‑C 原生（旧桥）与 Swift/TurboModule（新桥）兼容，直连测时，返回平均时延（毫秒）。
- 非移动端平台：返回 `null`。

## 安装（工作区内）

作为 Monorepo 子包已存在于 `packages/react-native-tcp-ping`，应用端在 `package.json` 中声明依赖即可（工作区内无需发布）。

自动链接：
- Android：无需额外配置。
- iOS：在 App 的 `ios/Podfile` 中会通过 Pod 自动链接（本仓示例：`pod 'TcpPing', :path => '../../packages/react-native-tcp-ping/ios'`）。
  - 首次或依赖变更后执行：`cd ios && pod install`

## 使用示例

```ts
import { startPing } from 'react-native-tcp-ping';

const avg = await startPing('8.8.8.8', 53, 4);
if (avg == null) {
  // 失败或不支持平台
} else {
  console.log('平均时延(ms):', avg);
}
```

## API

- `startPing(ip: string, port: number, times?: number): Promise<number | null>`
  - 返回平均时延（毫秒），失败返回 `null`。
- `startBatchPing(targets: BatchPingTarget[], onResult: (res: BatchPingResult) => void, options?: BatchPingOptions): BatchPingHandle | null`
  - 批量并行探测，原生会在同一个 `requestId` 上多次回调 `onResult`。
  - `BatchPingResult` 字段：
    - `host`/`port`：当前探测目标；无效目标会返回 `null`
    - `avgTime`：成功样本的平均耗时（毫秒）；失败返回 `null`
    - `successCount` / `totalCount`：本目标成功次数 / 总尝试次数
    - `done`：本次批量是否全部结束；为 `true` 时可清理监听
    - `cancelled`：是否因主动 `stop` 被取消
    - `error`：当前目标的错误信息（如 `invalid_target`）
- `stopBatchPing(requestId: string): void`
  - 主动终止批量任务（会触发一次 `cancelled=true` 的结果回调）。

### 批量并行示例

```ts
import { startBatchPing } from 'react-native-tcp-ping';

const handle = startBatchPing(
  [
    { host: '1.1.1.1', port: 53, count: 3 },
    { host: '8.8.8.8', port: 53 },
    { host: '223.5.5.5', port: 53, timeoutMs: 1500 },
  ],
  (res) => {
    console.log('批量结果', res);
    if (res.done) {
      handle?.dispose();
    }
  },
  { count: 4, timeoutMs: 3000 },
);

// 在任何需要的位置可主动终止
// handle?.stop();
```

## 迁移说明

本包用于替代历史实现：
- Android 旧包名 `top.tel.netdiag.TcpPing`（已在应用内移除）。
- iOS 自有实现 `QNNTcpPing`（已在应用内删除并用本包能力替换）。

应用接入方式统一为：

```ts
import { startPing } from 'react-native-tcp-ping';
const avg = await startPing('1.1.1.1', 443, 4);
```

如在纯原生页面复用，可参考应用侧的 Swift 封装 `TcpPingBridge.swift`（通过 BSD Socket 直连测速）。
