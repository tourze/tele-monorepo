# Telescope React Native 桌面平台接入 react-native-windows / react-native-macos 可行性评估

## 1. 项目现状概览
- 代码基座：`apps/telescope-react-native` 采用 React Native 0.74.6、React 18.2.0（参见 `apps/telescope-react-native/package.json`）。
- 移动端平台：维护 Android、iOS 目录，Hermes 已启用，`newArchEnabled=false`（`android/gradle.properties`），表示仍在旧架构。
- 桌面端实现：当前使用 Web + `react-native-web` 打包成 Tauri 应用，依赖大量 `@tauri-apps/api`、`@tauri-apps/plugin-*` 提供系统托盘、窗口管理、Shell 调用、进程控制、文件访问等能力（如 `src/desktop/tray.ts`、`src/utils/vpn/sing-box/startSingBox.ts` 等）。
- 工作区形态：Yarn 1 workspaces + Nx 项目结构，根 `package.json` 定义了 `nohoist` 阻止 React Native、Tauri 相关包外提，已有 Tauri 构建脚本（`project.json` 中多个 `cargo tauri` 目标）。

## 2. react-native-windows 适配分析
### 2.1 版本与兼容性
- 最新稳定版 0.80.1 要求 React Native 0.80.0+，需跨大版本升级。
- 与现有 RN 0.74 匹配的最高版本为 `react-native-windows@0.74.3`，其 peerDependencies 指向 `react-native@^0.74.0`、`react@18.2.0`，与现状兼容。
- RNW 0.74 支持 Hermes，新架构（Fabric/TurboModule）仍处在试验阶段，沿用旧架构风险更低。

### 2.2 必备环境
- 构建机需 Windows 10 20H1 (10.0.19041) 或以上，安装 Visual Studio 2022（17.7+）含 UWP/WinAppSDK workload、Windows SDK 10.0.19041。
- Node.js >=18（与 `react-native-windows@0.74.x` engines 对应），Yarn/NPM 皆可；考虑现有 Yarn 1 monorepo，可继续沿用，但需确保 `yarn windows` 脚本在 Nx 环境中正确定位到 app 根。

### 2.3 集成流程要点
1. 在项目根运行 `npx react-native-windows-init --overwrite --projectDirectory apps/telescope-react-native`（指定 language=cpp/C# 等）。Nx 结构较为特殊，需验证 CLI 能否识别 `app.json`、`package.json` 所在目录；必要时通过 `--pnpx` + 子目录执行。
2. CLI 将生成 `windows/` 目录、更新 `react-native.config.js`。当前仓库缺少该配置文件，需手动建立以确保 autolinking 正常。
3. 需要把 Nx/Metro 的自定义配置与 Windows 平台扩展对齐：确认 `metro.config.js` 在 `sourceExts` 中保留 `.windows.tsx` 等扩展；TSConfig 默认 glob 可识别，无需额外动作。
4. 桌面专用逻辑需提供 `.windows.ts(x)` 实现并移除 `@tauri-apps` 依赖；对系统托盘、窗口控制、Shell 调用等能力，需要各自寻找 RNW 插件或实现 C++/WinRT 原生模块。

### 2.4 功能差异与潜在补丁
- 系统托盘：当前依赖 `@tauri-apps/api/tray`（`src/desktop/tray.ts:1-110`）。RNW 中可选方案包括社区包 `react-native-tray`（维护度有限）、自行实现 Win32 通知区模块。
- 窗口与进程控制：现有 `spawn`、`executeCommand` 通过 Tauri Shell（`src/utils/shell/executeCommand.tauri.ts:1-39`、`src/utils/shell/spawn.tauri.ts:1-41`）实现。RNW 需编写 C++ 模块调用 Win32 API 或使用 Node 后端（但默认不包含 Node 环境）。
- VPN/网络代理：`startSingBox` 调用 Sidecar 可执行文件并处理管理员提权（`src/utils/vpn/sing-box/startSingBox.ts:1-138`）。RNW 无内建 Sidecar 概念，需要通过自定义原生模块包装 Win32 CreateProcess/UAC，以及文件读写 API。
- 文件系统/日志：Tauri `plugin-fs`、`plugin-log` 提供跨平台路径与日志目录。RNW 可依赖 `react-native-fs`（Windows 支持尚需验证）或自定义模块；日志可借助 community modules 或直接写入 `KnownFolders`.

## 3. react-native-macos 适配分析
### 3.1 版本与兼容性
- `react-native-macos@0.79.0` 已切换到 React 19/RN 0.79，超出当前版本。
- 匹配 0.74 的稳定版为 `react-native-macos@0.74.1`（peer 依赖 React 18.2.0），可以与现有代码保持一致。
- RN macOS 在 0.74 仍基于 Fabric 实验分支，可继续使用旧架构以降低风险。

### 3.2 必备环境
- macOS 13+，Xcode 15（官方推荐），安装 Cocoapods。
- Apple Silicon 上需配置 Rosetta 以兼容 x86_64 依赖。
- Node >=18，与现有要求一致。

### 3.3 集成流程要点
1. 使用 `npx react-native-macos-init` 在 `apps/telescope-react-native` 目录生成 `macos/` 工程。
2. 新增的 Podfile 需与现有 iOS 工程并存；由于项目已有复杂的 pod install 流程（`npm run pod-install` 调用 `fix-pods.js`），需要扩展脚本以处理 macOS target。
3. Hermes 在 macOS 默认关闭，如需统一 JS 引擎，需要在 `podfile` 与 macOS Xcode target 中启用并验证构建。
4. 同样需要针对 `@tauri-apps` 功能补齐 `.macos.ts(x)` 实现，尤其是菜单、托盘、进程控制、文件访问等。

### 3.4 功能差异与潜在补丁
- 菜单/托盘：可使用 `@react-native-menu/menu`（仅 iOS/macOS 菜单栏）搭配社区托盘库或自行桥接 AppKit。
- 进程与 Shell：需编写 Objective-C++ 模块调用 `NSTask`、`Process` API 以复现 Tauri Sidecar。
- 窗口控制：React Native macOS 通过 `RCTWindow` 限制较多，若需要隐藏/显示窗口，需自定义原生 API。

## 4. 依赖与平台可用性盘点
下表列出重点第三方库的桌面支持状况（基于公开文档与社区维护情况）：

| 依赖 | 主要用途 | Windows 支持现状 | macOS 支持现状 | 备注 |
| --- | --- | --- | --- | --- |
| `@notifee/react-native` | 推送通知 | ❌ 无 Windows 支持 | ⚠️ 仅 iOS/Android | 需改用 Windows Toast / macOS UserNotifications 原生实现 |
| `react-native-bootsplash` | 启动屏 | ❌ | ⚠️ Web/桌面需自定义 | 桌面端需重写启动逻辑 |
| `react-native-device-info` | 设备信息 | ⚠️ 社区 PR 未合并 | ⚠️ 部分字段缺失 | 需评估替代 |
| `react-native-gesture-handler` | 手势 | ⚠️ Windows 处于试验 | ⚠️ macOS 维护稀缺 | 大量 UI 交互依赖，需验证 |
| `react-native-reanimated` | 动画 | ❌ Windows 构建困难 | ⚠️ macOS 需补丁 | 可考虑降级到 Animated 或等待官方支持 |
| `react-native-view-shot` | 截图 | ❌ | ⚠️ 需定制 | 桌面可用原生 API |
| `react-native-image-crop-picker` | 图库/裁剪 | ❌ | ⚠️ (mac 未维护) | 需替换 |
| `react-native-permissions` | 权限管理 | ❌ | ⚠️ | 桌面权限模型不同，需单独实现 |
| `@react-native-tethering/*` | 网络共享 | ❌ (Android 专用) | ❌ | 需条件编译 |
| `@tauri-apps/*` 系列 | 桌面专属能力 | ❌ | ❌ | 需全部替换为 RN 原生模块 |

> 判定标准：✅ 官方/社区明确支持；⚠️ 支持不完整或需额外补丁；❌ 无支持或移动专用。

## 5. 桌面特性迁移工作量评估
### 5.1 系统集成功能
- 托盘/菜单/窗口控制、IPC 与单例：依赖 Tauri 插件（`src/desktop/tray.ts:1-110`、`src-tauri/src/lib.rs:5-43`）。RN 平台需自行维护原生层，工作量高，且 Windows/macOS 需分别实现。
- 外部命令执行、Sidecar 管理：`spawn/executeCommand`（`src/utils/shell/*.tauri.ts`）与 `startSingBox`（`src/utils/vpn/sing-box/startSingBox.ts:1-138`）深度依赖 Tauri Sidecar、UAC/AppleScript。RN 需构建原生模块并处理权限弹窗、日志上报。
- 文件系统/配置：大量 `@tauri-apps/plugin-fs` 与 `appCacheDir`/`appConfigDir` 使用（如 `src/utils/file/writeTextFile/index.tauri.ts`、`src/utils/app/getChannelName.tauri.ts`）。RN 需统一封装平台路径访问。

### 5.2 网络与代理
- NAT 检查、禁用系统代理、VPN 控制均通过 `invoke` 调用 Rust 命令（`src/utils/network/natCheck.tauri.ts`、`src/utils/disableOsProxy.tauri.ts`）。RN 端需实现 Win32 WMI/NETSH、macOS `networksetup`/`scutil` 调用。

### 5.3 构建流水线影响
- 需新增 `windows`、`macos` 目录进入版本管理，并在 Nx 项目中注册对应构建目标。
- 现有 CI/CD（若有）需扩展安装 Visual Studio、Xcode，构建耗时显著增加。
- Tauri Rust 代码如继续保留，需明确与 RN 桌面版本的关系：是完全替换还是双线维护。若双线并行，需分别维护两套桌面实现及发行流程。

## 6. 风险与缓解策略
| 风险 | 描述 | 影响 | 缓解策略 |
| --- | --- | --- | --- |
| 核心依赖缺乏桌面实现 | Reanimated、Notifee 等 | 高 | 评估业务可否降级；如必须保留，需自研原生模块 |
| Tauri 功能迁移成本 | 托盘、命令执行、Sidecar | 高 | 梳理功能优先级，先迁移关键 VPN 功能；考虑保留 Tauri 作为桌面主线 |
| CLI 与 Nx 目录冲突 | `react-native-windows-init` 默认假设标准结构 | 中 | 在子目录执行 CLI，必要时手工修改 `windows/*.vcxproj`、`react-native.config.js` |
| 构建环境复杂度 | 需要 VS2022 + Xcode + Node18 | 中 | 使用独立构建机或容器镜像，编写自动化脚本 |
| 团队维护成本 | RN 桌面生态小众，社区活跃度低 | 中 | 设立长期维护计划，跟踪微软官方发布节奏 |

## 7. 分阶段实施建议
1. **预研阶段**：在独立分支搭建最小可行 Demo，引入 `react-native-windows@0.74.3` 与 `react-native-macos@0.74.1`，验证 CLI 与构建是否在 Nx 环境下可行，记录必要的脚本改动。
2. **核心功能梳理**：列出所有 `.tauri.ts` 文件对应的业务场景，评估哪些必须在桌面端实现，优先处理 VPN/代理链路与系统托盘等核心功能。
3. **原生模块实现**：针对共性能力（文件系统、命令执行、侧载可执行文件）设计抽象层，分别落地 Windows C++/WinRT 与 macOS Objective-C++ 模块，结合 RN Codegen 或手写桥接。
4. **UI 与交互适配**：验证手势、动画库在桌面端表现，必要时调整为传统桌面交互模式（鼠标、键盘导航）。
5. **测试与分发**：建立 Windows/MSIX 与 macOS `.app`/`.pkg` 打包链路，确保与现有 Tauri 渠道区隔，设定内测周期。

## 8. 结论
- 从版本层面，现有 React Native 0.74.6 可与 `react-native-windows@0.74.3`、`react-native-macos@0.74.1` 匹配，无需立即升级核心框架。
- 但项目高度依赖 Tauri 提供的系统能力，React Native 桌面生态缺乏直接替代方案，必须投入大量原生开发工作才能复现关键 VPN/代理、托盘、Shell 等功能。
- 若目标是统一移动与桌面代码，可考虑 **在保证 Tauri 版本稳定的前提下，逐步验证 RN 桌面可行性**，短期内不建议直接替换现有 Tauri 桌面实现。
- 建议先完成 Demo 级验证与功能梳理，再决定是否投资全量迁移，否则保守方案为继续迭代 Tauri，同时关注 React Native 桌面生态的最新进展。
