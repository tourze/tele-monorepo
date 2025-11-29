# tauri-plugin-tcp-ping

独立的 TCP Ping Tauri 插件，复用 telescope-react-native 中的实现，方便其它桌面项目按需引用。

## 使用方式

1. 在 `Cargo.toml` 中添加依赖：

```toml
[dependencies]
tauri-plugin-tcp-ping = { path = "../../packages/tauri-plugin-tcp-ping" }
```

2. 在 Tauri 启动逻辑里注册插件：

```rust
fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_tcp_ping::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
```

3. JS 侧暴露的接口与 `packages/react-native-tcp-ping` 保持一致，可按如下方式使用：

```ts
import { startPing, startBatchPing, stopBatchPing } from 'tauri-plugin-tcp-ping'

const latency = await startPing('1.1.1.1', 443, 4)

const handle = startBatchPing(
  [{ host: '1.1.1.1', port: 443 }, { host: '8.8.8.8', port: 53 }],
  (result) => {
    console.log(result)
  },
)

// 可在需要时手动停止
 stopBatchPing(handle?.requestId ?? '')
```

底层同样是调用 `invoke('plugin:tcp-ping|tcping', { host, port, count, timeout_ms })`，只是封装成与 React Native 版本一致的体验，方便跨端共享业务逻辑。

> 批量接口由 Rust 插件统一调度，进度与结果会通过 `TcpPingBatchResult` 事件推送回前端，因此无需在 JS 侧自行遍历执行。
