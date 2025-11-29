# react-native-curl

`react-native-curl` 提供跨端 React Native 原生模块，基于 `libcurl` 封装 HTTP/HTTPS 请求能力，便于在应用侧完全掌控网络栈（自定义 DNS、证书锁定、IP Override 等）。

## 功能特性

- **统一接口**：JS 层 `Curl.request` 返回状态码、Header、Body（二进制）。
- **自定义解析**：可传入自定义 DNS 服务器、强制指定连接 IP，实现与系统 DNS 脱钩。
- **安全控制**：支持公共密钥指纹锁定（`CURLOPT_PINNEDPUBLICKEY`）、自定义 CA 证书或跳过校验。
- **协议能力**：原生层启用 HTTP/1.1 与 HTTP/2，支持重定向控制、压缩格式声明等。
- **时序指标**：返回 `nameLookupMs`、`connectMs`、`startTransferMs` 等关键耗时便于埋点。

## 安装

在 monorepo 中已经作为 workspace 包存在，执行常规安装流程即可：

```bash
yarn install
```

### iOS

1. 进入应用目录执行 `pod install`，Podspec 会自动拉取 `curl` 静态库。
2. `libcurl` 依赖 C++17，请确保 Xcode 14+，部署版本满足 `min_ios_version_supported`。

### Android

1. 构建阶段通过 CMake `FetchContent` 拉取 `mbedtls` 与 `curl` 源码，需要联网。
2. 需安装 NDK（默认 `27.1.12297006`）与 CMake 3.22+，Gradle 会自动编译静态库。

如需离线构建，建议提前下载上述依赖并在 CMake 中替换为本地镜像。

## 使用示例

```ts
import { Curl } from "react-native-curl";

async function fetchConfig() {
  const res = await Curl.request({
    url: "https://api.example.com/bootstrap",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-App-Version": "1.0.0",
    },
    body: JSON.stringify({ region: "cn" }),
    timeoutMs: 8000,
    connectTimeoutMs: 2000,
    dnsServers: ["114.114.114.114", "223.5.5.5"],
    ipOverride: "203.0.113.10",
    followRedirects: false,
  });

  if (!res.ok) {
    console.warn("curl 请求失败", res.error);
    return null;
  }

  const text = res.bodyText ?? "";
  return JSON.parse(text);
}
```

### 取消请求

```ts
const requestId = `curl-${Date.now()}`;
Curl.request({ url, requestId }).then(...);

// 某些场景需要中断
await Curl.cancelRequest(requestId);
```

## 注意事项

- 大体积响应（如下载文件）当前会完整缓存到内存后再返回，若需流式能力可在原生侧扩展。
- Android 端首次构建时间较长（需编译 libcurl + mbedtls），建议缓存 `~/.gradle/caches`。
- Android 侧在构建 mbedtls v3.6.2 时自动启用了 `MBEDTLS_THREADING_C`/`MBEDTLS_THREADING_PTHREAD`，用于规避官方 issue #10103 提到的 TLS1.3 多线程崩溃（典型报错 `ssl_handshake returned - mbedTLS: (-0x006E)`）；如需自定义配置，请确保继续开启线程安全选项。
- 若启用自定义 CA，请确保字符串为完整 PEM 内容；多条指纹请使用数组传入。

## 开发指引

- TypeScript 源码位于 `src/`，构建输出指向同目录。
- Android 原生实现：`android/src/main/java/com/reactnativecurl/` + `cpp/`。
- iOS 原生实现：`ios/Curl.mm`，Podspec 会注入 `curl` 依赖。

如需扩展功能（例如上传/下载进度事件、分块写入等），建议复用现有 C++ 封装，保持跨端一致性。欢迎补充测试用例与文档，便于后续维护。
