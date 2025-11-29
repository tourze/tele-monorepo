# react-native-mihomo 模块化可行性报告

本文评估围绕 mihomo（Clash.Meta 更名内核）在 React Native 项目中的模块化集成可行性，目标是在 `packages` 目录沉淀一个可复用的 `react-native-mihomo` 模块，向宿主 App 提供统一的 VPN/TUN、代理编排、测速、路由与 DNS 能力。

参考代码基线：apps/telescope-react-native 当前 SSR 模块化报告与工程结构；第三方内核：MetaCubeX/mihomo（Alpha 分支）。

---

## 一、目标与边界

- 目标
  - 提供跨平台 RN API：启动/停止内核、热重载配置、查询/切换节点、测速、事件订阅（日志/流量/状态）。
  - Android 采用 `VpnService + mihomo 内核` 的 TUN 模式；iOS 采用 `PacketTunnel + mihomo 内核`。
  - 内核通过 `external-controller` 暴露 REST API，JS 层以 HTTP/SSE 驱动管理界面与数据流。
  - 降低对历史 SO（tun2socks/ss-local/pdnsd）的依赖，尽量收敛为单一内核。

- 范围
  - RN 模块（JS/TS + Native 模块桥）设计与封装。
  - Android `VpnService` 子类、权限引导、FD 保护（protect）回调对接。
  - iOS `Network Extension` PacketTunnel 集成（以 gomobile/静态库方式嵌入内核）。
  - 二进制发版/装配方案、配置/规则/Geo 数据管理、测速方案。

- 非目标（本阶段不做）
  - UI/Dashboard 二次开发（可复用 metacubexd 或宿主已有 UI）。
  - 第三方协议扩展开发（遵循 mihomo 现有能力）。

---

## 二、mihomo 能力与形态

- 内核能力（依据官方 README 与 config.yaml）
  - 入站：HTTP(S)/SOCKS 混合端口、TUN（stack: system/gvisor/mixed）、TProxy/Redir（非移动端优先）。
  - 协议：VMess/VLESS/SS/Trojan/Snell/TUIC/Hysteria 等。
  - DNS：内置 DNS（DoH/DoT/FAKE-IP/REDIR-HOST）、DNS 劫持（dns-hijack）、嗅探（SNI/HTTP/QUIC）。
  - 路由：域名/GeoIP/IPCIDR/进程/规则集（rule-provider），分组（url-test/select/fallback/load-balance）。
  - 控制：`external-controller` REST API + SSE，`/proxies/*`、`/configs`、`/traffic`、`/logs`、`/proxies/.../delay` 等。

- 官方发行物与构建
  - GitHub Releases 提供 Android 各 ABI 压缩包：`mihomo-android-arm64-v8-*.gz`、`armv7`、`amd64`、`386` 等；iOS 未提供可直接执行的二进制，通常需 gomobile/静态库嵌入。
  - 编译 TUN：`-tags with_gvisor` 可启用 gVisor TUN 栈；移动端更常见是结合系统 TUN（Android VpnService / iOS PacketTunnel）。

---

## 三、RN 模块 API 设计（草案）

以“内核进程 + REST 控制 + 原生生命周期管理”为核心，建议导出以下 API（命名以中文注释为准）：

```ts
type StartOptions = {
  // 必选：mihomo 配置（YAML 字符串或对象）
  config: string | Record<string, any>;
  // 控制端口/密钥（若未显式设置，模块自动分配并回填）
  controller?: { host?: string; port?: number; secret?: string; https?: boolean };
  // TUN 与路由参数（跨平台抽象，最终落入 mihomo config.tun/路由）
  tun?: { enable?: boolean; stack?: 'system' | 'gvisor' | 'mixed' };
  // Android 专属：是否拉起 VpnService 权限申请
  android?: { requestPermissionIfNeeded?: boolean };
  // iOS 专属：NE 配置项（描述、分流包名等）
  ios?: { description?: string };
};

type SpeedTestMode = 'through-proxy' | 'direct-bypass';

declare const Mihomo: {
  // 启动/停止/热重载
  start(opts: StartOptions): Promise<{ controller: string; secret?: string }>;
  stop(): Promise<void>;
  reload(config: string | Record<string, any>): Promise<void>;

  // 状态/控制（基于 REST）
  version(): Promise<string>;
  traffic(): Promise<{ up: number; down: number }>;
  listProxies(): Promise<any>; // 透传 /proxies
  selectProxy(group: string, name: string): Promise<void>;

  // 测速：
  // - through-proxy：调用 /proxies/{name}/delay?url=... （与 clash/mihomo 一致）
  // - direct-bypass：原生发起直连 HTTP 请求，绕过隧道（Android 使用 protect 套接字；iOS 走系统会话）
  speedTest(target: string, mode?: SpeedTestMode, timeoutMs?: number): Promise<number>;

  // 事件：日志/流量（SSE 或轮询）
  addListener(event: 'log' | 'traffic' | 'state', cb: (payload:any)=>void): () => void;
};
```

说明：
- 测速双路径满足“测速不应经过 socks5”的诉求（direct-bypass），同时保留与 mihomo 原生延迟评估一致的 `through-proxy` 能力。
- `start` 返回 controller 信息，方便 JS 侧直连 REST API 做高级操作（例如 provider 更新、规则切换）。

---

## 四、Android 集成设计

方案优先级：

1) 推荐：`VpnService + 内核以进程运行（捆绑二进制）`
- 打包方式：将各 ABI 的 `mihomo` 可执行文件置于 `android/src/main/jniLibs/<abi>/mihomo`（或 `assets` 后首次运行解压到 `filesDir/bin` 并 `chmod +x`）。
- 启动方式：由 `MihomoVpnService` 创建 TUN、设置 DNS/路由，然后以子进程启动 `mihomo`，主进程通过本地端口访问 `external-controller`。
- 保护套接字：通过 `VpnService.protect(fd)` 暴露给内核（两种实现）
  - A. 使用 `stack: system`，由内核走系统栈；
  - B. 使用 gVisor 栈时，仍需要对出站直连（controller/ui 下载/测速直连）调用 `protect`。
- 权限与生命周期：
  - 第一次需要 `VpnService.prepare(ctx)` 引导授权；
  - 前台常驻通知，符合系统后台限制；
  - 使用 `WorkManager`/`ForegroundService` 保活（可选）。

2) 备选：`内核以 AAR/so 方式嵌入（gomobile）`
- 使用 gomobile 将 mihomo 编译为共享库，提供 `Start/Stop/Reload` 等导出方法，并从 Kotlin 调用；
- 优点：避免子进程/exec 限制；可直接传入 TUN FD 与 protect 回调；
- 缺点：构建链复杂、二进制体积更大、升级维护成本提升。

文件与组件：
- `packages/react-native-mihomo/android/src/main/java/.../MihomoVpnService.kt`：
  - 建立 TUN（`Builder.addAddress/addRoute/addDnsServer`）、`setBlocking`、`establish()`；
  - 准备工作目录：`filesDir/mihomo/{config, logs, ui, providers}`；
  - 写入合成后的 `config.yaml`（将 JS options 融合用户配置）；
  - 启动 `mihomo` 二进制：`ProcessBuilder([..."-d", workDir, "-f", configPath])`；
  - 监听子进程、暴露 `external-controller`、转发日志到 RN EventEmitter；
  - `protect(fd)` 与直连测速实现（`OkHttp` + `SocketFactory` 自定义）。
- `packages/react-native-mihomo/android/src/main/java/.../MihomoModule.kt`：RN 原生模块桥。

运行模式建议：
- `tun.enable: true, tun.stack: system`，使用 Android 系统网络栈，配合 `dns-hijack` 与本地 `nameserver`。
- `external-controller: 127.0.0.1:<auto>`；`secret` 随机生成并回传到 JS。
- `allow-lan: false`（移动端默认关闭外网暴露），若需同局域网调试可临时开启。

---

## 五、iOS 集成设计

受 iOS 沙箱限制，不能在 App 内任意 `exec` 外部二进制；正确路径是作为库嵌入并在 `Network Extension`（PacketTunnel）中运行核心逻辑。

两种可行路线：

1) 推荐：`gomobile/静态库方式集成 mihomo`（与部分开源客户端接入 Clash/Sing-Box 的方式类似）
- 使用 gomobile 将内核编译为 iOS 静态库/Framework（例如 `MihomoKit.framework`），暴露 `Start/Stop/Reload/SetConfig/ExportLog` 等接口；
- 在 `PacketTunnelProvider` 中：
  - 配置 `NEPacketTunnelNetworkSettings`（包含 IPv4/IPv6、DNS、MTU）并 `setTunnelNetworkSettings`；
  - 启动内核并监听 `external-controller` 于 `127.0.0.1:<auto>`；
  - 实现 `flow -> core` 的桥接，以及必要的 `proxy-bypass`（速度直连测试时使用 `NWConnection` 到系统栈，不走隧道）。
- RN 侧通过主 App 的 `NEVPNManager/NETunnelProviderManager` 控制 Extension 的启动/停止与配置下发。

2) 备选：`以可执行体嵌入 Extension`（风险高，不推荐）
- 将二进制置于 Extension Bundle 内尝试 `posix_spawn` 运行，存在审核与沙箱风险，不建议。

实现要点：
- Pod 集成：提供 Podspec，主 App 引入 `react-native-mihomo`，其 Subspec 为 `MihomoTunnel`，包含 `PacketTunnel` 模板代码与 `MihomoKit.framework`；
- 配置项：`App Groups`、`Network Extension` 权限、`com.apple.developer.networking.networkextension` 的 `packet-tunnel-provider`；
- 直连测速：使用 `URLSessionConfiguration.ephemeral` + `NWParameters`，并确保由系统网络栈发起，不进入隧道；
- 日志与事件：使用 `os_log`/文件落盘 + `CFNotificationCenter`/`XPC` 与主 App 通讯，RN 模块转发为事件。

附：gomobile 打包思路（示例）
- 依赖：Go 1.20+，`gomobile`/`gobind`
- 步骤：
  - `go install golang.org/x/mobile/cmd/gomobile@latest && gomobile init`
  - 在 mihomo 源码中准备最小导出层（例如 `package mobile` 暴露 `Start/Stop/Reload`），避免直接导出大量符号；
  - `gomobile bind -target=ios -ldflags "-s -w" -o MihomoKit.framework ./mobile`
  - 将 `MihomoKit.framework` 作为 CocoaPods 资源或直接嵌入 `PacketTunnel` Target；
  - 注意：关闭 CGO 或处理相应依赖；控制产物体积与符号冲突；设置 `IPHONEOS_DEPLOYMENT_TARGET` 与 `BUILD_LIBRARY_FOR_DISTRIBUTION`。

---

## 六、配置与规则策略（对接现有分流/ACL）

- DNS 策略
  - 建议启用内置 DNS，移动端优先 `redir-host`（避免 FAKE-IP 对个别 App 的兼容性问题），需要域名路由尽量配合 `sniffer`；
  - 若现有服务端生成 ACL/策略列表，可转换为 mihomo 的 `rule-providers` 与 `rules`（域名/GeoIP/IPCIDR），在首次启动时下载至工作目录；
  - `dns-hijack: [0.0.0.0:53]` 可将系统 DNS 流量引入内核解析，保证域名分流有效性。

- 分流规则映射
  - 现有 `AclBuildView`（无法在本仓库直接读取）若导出为域名/IP 列表，可生成如下片段：
    - `rule-providers: { my-domains: { type: http, behavior: domain, url: <server>, path: rules/my-domains.yaml } }`
    - `rules: [ RULE-SET,my-domains,Proxy, … ]`
  - 对于“按进程/包名”分流（Android），可利用 `tun.include/exclude-package`；iOS 无法基于进程名分流，但可通过域名与 DNS/SNI 嗅探达到接近效果。

- 兼容性注意
  - iOS 侧域名分流：借助嗅探与 DNS 解析映射，域名规则可生效，但对少数非 SNI/加密的场景依赖 IP 规则兜底；
  - Android 侧：可结合包名白名单/黑名单满足“特定 App 直连/代理”。

---

## 七、测速方案设计

- 模式一（与 Clash/Mihomo 一致）
  - 使用 REST：`POST /proxies/{name}/delay?url=https://www.gstatic.com/generate_204&timeout=5000`
  - 优点：与内核路由/握手路径一致、可并发评估分组 `url-test`；
  - 缺点：链路总是“经由代理”，并非“系统直连能力”的度量。

- 模式二（直连 bypass 隧道，建议新增 API 默认此模式）
  - Android：原生使用 `OkHttp`/`HttpURLConnection`，其底层 `Socket` 通过 `VpnService.protect(fd)` 保护，从而绕过隧道直连 `generate_204`；
  - iOS：使用 `URLSession` + `NWParameters`，保证连接不被 NE 重定向到隧道；
  - 作用：评估“本机直连外网可用性/质量”，与代理测速互补。

- RN 暴露统一方法 `speedTest(target, mode)`，并将两者结果区分展示。

---

## 八、二进制与 NDK 评估

- Android：
  - 若采用“进程方式”运行内核，不需要额外 NDK，仅需常规 `ProcessBuilder` 与权限；
  - 历史 `libchang.so`（示例）/`tun2socks`/`ss-local`/`pdnsd` 可逐步移除；如需过渡，可保留 `tun2socks -> socks-inbound` 的兼容路径。

- iOS：
  - 需要通过 gomobile 构建静态库/Framework；不再需要第三方 `tun2socks` 源码；
  - `PacketTunnel` 仍是必须（系统要求），但隧道内实际代理/分流由 mihomo 负责。

---

## 九、开源依赖与源码回溯

- mihomo 内核：
  - 仓库：MetaCubeX/mihomo（Alpha 分支）
  - 文档：wiki.metacubex.one、`docs/config.yaml`
  - 发行：GitHub Releases（含 Android 多架构包）

- Dashboard：
  - metacubexd（可选）

- 可替代对比：
  - sing-box：移动端集成成熟度高（存在多个 iOS/Android 客户端集成经验），若 mihomo iOS 嵌入困难，可作为 Plan-B。

---

## 十、风险与缓解

- iOS 集成复杂度高
  - 风险：gomobile 打包/兼容性、Extension 体积与内存、审核对 VPN 权限要求。
  - 缓解：
    - 提供最小可行的 `PacketTunnel` 模板与自动化脚本（pod install 阶段生成 Target/Entitlements）；
    - 分阶段：先落地 Android，再攻克 iOS；必要时准备 sing-box 备选方案。

- Android TUN 行为差异
  - 风险：不同厂商对后台/前台服务限制、socket 保护与电池策略。
  - 缓解：前台服务 + 电池白名单引导；稳定性监控（子进程存活/重启）。

- 旧资产迁移
  - 风险：历史 ACL 与规则体系与 mihomo 差异。
  - 缓解：在服务端生成兼容的 `rule-providers`；JS 侧提供迁移脚本。

---

## 十一、实施计划（建议）

1. RN 模块脚手架与 API 定义
  - `packages/react-native-mihomo`: JS/TS 定义、事件通道、REST 封装、配置合成器。

2. Android 端 MVP
  - 集成 `MihomoVpnService` 与权限流程；
  - 打包并启动内核二进制，开放 `external-controller`；
  - 打通 `speedTest(direct/through-proxy)`；
  - 验证 DNS 劫持与域名分流；
  - 文档与样例：最小配置启动、分组切换、日志查看。

3. iOS 端技术验证
  - gomobile 打包 mihomo 为 iOS Framework；
  - `PacketTunnel` 模板与主 App 控制通道；
  - 打通基本连通、REST 控制与直连测速；

4. 规则/Geo 数据与 Provider 对接
  - 接入服务端生成的 rule-providers；
  - UI 侧节点测速与选择联动；

5. 渐进替换历史 SSR 组件
  - 在特性对齐后移除 `tun2socks/ss-local/pdnsd` 等冗余。

---

## 十二、结论

围绕 mihomo 构建 `react-native-mihomo` 模块在技术上可行，且能显著收敛现有多组件（tun2socks/ss-local/pdnsd）带来的维护成本。Android 侧以子进程运行内核、配合 `VpnService` 最为直接稳妥；iOS 侧需投入一定工程量（gomobile + PacketTunnel），但路径明确，社区已有类似内核（Clash/Sing-Box）的成功实践可复用。测速建议提供“通过代理”与“直连绕行”两种模式，既对齐 mihomo 的延迟评估，也满足“不应经过 socks5”的产品诉求。

建议按“Android 优先、iOS 并行验证”的节奏推进，首阶段将模块接口与 Android MVP 落定，随后补齐 iOS 集成与规则体系迁移。
