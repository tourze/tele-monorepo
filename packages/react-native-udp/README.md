# react-native-udp

`react-native-udp` 提供跨端 UDP 套接字能力，支持在 React Native 中直接收发二进制报文，适合实现 DNS 查询、局域网发现等轻量网络场景。

## 功能概览

- **跨平台**：Android 使用 `DatagramSocket`，iOS 依赖 `GCDAsyncUdpSocket`，多端行为一致。
- **事件回调**：统一通过 `udpOnMessage` 事件推送收包信息，包含来源地址、端口与 Base64 数据。
- **可选绑定**：支持指定本地地址/端口、开启端口复用，便于复用 53/udp 等固定端口。
- **JS 便捷 API**：封装 Base64/UTF-8/HEX 转换，默认输出 `Uint8Array` 与字符串双视图。

## 安装

包已包含在 monorepo workspace 内，执行一次依赖安装即可：

```bash
yarn install
```

### iOS

- 在应用目录执行 `pod install`，自动拉取 `CocoaAsyncSocket`。
- 需要 Xcode 14+，部署目标需满足 `min_ios_version_supported`。

### Android

- 仅依赖标准 `DatagramSocket`，无需额外原生三方库。
- 如需在 VPN/后台场景使用，请根据业务评估 Doze/省电策略影响。

## 快速上手

```ts
import { Udp } from "react-native-udp";

async function queryDns() {
  const socket = await Udp.createSocket({
    localPort: 0,
    reusePort: false,
  });

  const subscription = socket.addListener((msg) => {
    console.log("收到响应", msg.remoteAddress, msg.remotePort, msg.data);
    subscription.remove();
    socket.close();
  });

  // 构造 DNS 查询报文（示例使用 Uint8Array）
  const payload = new Uint8Array([0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00 /* ... */]);

  await socket.send(payload, "114.114.114.114", 53);
}
```

也可通过全局函数直接操作：

```ts
import { createSocket, send, close } from "react-native-udp";

const socket = await createSocket();
await send(socket.socketId, "你好", "223.5.5.5", 53, { encoding: "utf8" });
await close(socket.socketId);
```

### 事件监听

```ts
import { addMessageListener } from "react-native-udp";

const subscription = addMessageListener((msg) => {
  console.log(msg.socketId, msg.length, msg.dataText);
});

// 需要时取消
subscription.remove();
```

## 注意事项

- 每个 socket 默认在原生层常驻单独线程，请及时调用 `close()` 避免资源泄露。
- iOS 上 `localAddress` 参数需要填写 IP 地址；若需按网卡绑定，可传入接口名（如 `en0`）。
- 当前实现仅提供单播/广播基础能力，如需多播加入、TTL 配置等高级功能，可在原生层扩展。
- JS 层编码默认使用 UTF-8 输出 `dataText`，二进制场景请直接读取 `result.data`（`Uint8Array`）。

欢迎根据业务扩展能力，例如发送超时、批量查询、统计埋点等。
