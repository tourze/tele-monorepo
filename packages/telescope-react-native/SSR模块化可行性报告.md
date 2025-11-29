# react-native-shadowsocksr 模块化可行性报告

本文评估将 apps/telescope-react-native 中与 ShadowsocksR/VPN 相关的 JS、Android、iOS 与 NDK 逻辑抽离为独立的 React Native 原生模块（暂定包名：`react-native-shadowsocksr`，放置到 `packages` 目录）的可行性、改造点、风险与实施计划。

## 一、背景与目标
- 目标：沉淀通用的 SSR/TUN VPN 能力为独立 RN 模块，供宿主 App 复用，降低耦合、便于演进与测试。
- 范围：JS 封装、Android VPNService 与本地守护进程、iOS PacketTunnel 集成、相关 NDK/二进制与 ACL 资源、跨平台 API 设计。

## 二、现状梳理（代码结构与职责）

### 2.1 JS 层
- 入口 API（按平台分发）：
  - `apps/telescope-react-native/src/utils/vpn/vpnStart.*`、`vpnStop.*`、`vpnStatus.*`、`vpnPrepare.ts`。
  - Android 侧调用 `NativeModules.TTManager.startVService(...)` 启动；iOS 侧调用 `TTManager.connectVPN(...)`。
- 业务参数整理：Android 端在 JS 里先做了 IP 解析、UDP/路由/局域网/自定义 TUN 地址与 UDP 监听等拼装，然后丢给原生。

### 2.2 Android 侧
- 核心服务：`ShadowsocksVpnService`（`android.net.VpnService`）负责：
  - 建立 TUN：配置 `addAddress/addRoute/addDnsServer` 等；
  - 启动本地进程：`libtun2socks.so`、`libss-local.so`、`libpdnsd.so`，通过 `GuardedProcess` 管理；
  - 通过本地 `LocalSocket` 与 `sendfd` 将 TUN FD 传给 `tun2socks`；
  - 根据路由模式与 ACL 生成配置文件，落盘到 App data 目录；
  - 维护流量统计与回调（`IShadowsocksServiceCallback`）。
- AIDL：`IShadowsocksService.aidl`/`IShadowsocksServiceCallback.aidl` 暴露状态与回调；
- UI/权限引导：`ShadowsocksRunnerActivity` 触发 `VpnService.prepare` 授权；
- JS Bridge：`CalendarModule`（RN Module，导出名 `TTManager`）将 JS 请求转给 `MainActivity`/`MainApplication`/Service；
- Profile 模型：`com.shadow.ssrclient.database.Profile` 封装 SSR 连接参数（协议、混淆、用户、端口、路由、UDP 等）；
- 依赖与资源：
  - 预编译 SO：`android/app/libs/*/libss-local.so`、`libtun2socks.so`、`libpdnsd.so`、`libsystem.so`（JNI `sendfd/jniclose`）。
  - 资源：`assets/acl/*.acl`、`R.array.bypass_private_route` 等；
  - NDK：`app/src/main/cpp/CMakeLists.txt` 构建一个小型库 `libchang.so`（与 SSR 核心关联不大）。
- 当前耦合点：
  - 直接引用 `com.reactnative.MainApplication`（如 `MainApplication.getCurrentProfile()`、`app.updateAssets()`、埋点/监控），导致服务对宿主应用类强耦合；
  - `IShadowsocksService.use(profileId)` 以“id=1 代表从 MainApplication 取最新 Profile”的约定进行跨进程传参，不够通用；
  - Manifest 与 Gradle 插件（如 stringfog、junk code、新遗留配置）在 App 侧配置，库化需精简。

主要参考：
- Android 服务与线程：`android/app/src/main/java/com/shadow/ssrclient/service/ShadowsocksVpnService.kt`、`ShadowsocksVpnThread.kt`
- JS Bridge：`android/app/src/main/java/com/reactnative/CalendarModule.kt`
- AIDL：`android/app/src/main/aidl/com/reactnative/IShadowsocksService.aidl`、`IShadowsocksServiceCallback.aidl`
- 资源与二进制：`android/app/libs/...`、`android/app/src/main/assets/acl/...`

### 2.3 iOS 侧
- 架构：NEPacketTunnel Provider + tun2socks + ss-local（C 层接口），再由 Shadow 库封装：
  - PacketTunnel 目录：`ios/PacketTunnel/*`（`TunnelInterface.m` 调 tun2socks；`ProxyManager.m` 启动 ss-local 并回调 Socks5 端口）。
  - 业务管理：`ios/ShadowLibrary/Manager.swift` 负责切换/连接/状态；
  - RN Bridge：`ios/Shadow/TTManager.m` 导出 `setProxyMode/connectVPN/stopVPN/vpnStatus` 等方法。
- 当前耦合点：
  - PacketTunnel Extension、ShadowLibrary 与主应用工程深度绑定（Target、Entitlements、App Groups、Pod/xcworkspace 结构）；
  - RN Bridge 直接依赖 `Manager.sharedManager` 的单例与 iOS 侧存储；
  - Pod/脚本与 Xcode 配置散落在 App 工程中。

### 2.4 NDK/二进制
- Android 侧 SSR 运行主要依赖预编译 SO（以可执行共享库方式运行）；工程内同时保留对应 NDK 源码以便溯源或备选自编译，运行期不强制依赖构建该源码；
- JNI `sendfd/jniclose` 在 `libsystem.so` 中提供，对应 Java 封装 `com.github.shadowsocks.System`；
- iOS 侧 C 代码直接集成在工程（tun2socks、socksclient）并通过 PacketTunnel 运行。

## 三、抽象边界与模块 API 设计

建议在 `react-native-shadowsocksr` 暴露一致的跨平台 API（JS）：
- `prepare(): Promise<boolean>`
  - Android：触发 `VpnService.prepare` 授权（必要时弹出引导 Activity）；
  - iOS：可空实现（返回 true），实际权限在系统弹窗与配置中处理。
- `start(config: SSRConfig & Options): Promise<boolean>`
  - 统一 Profile 结构（host/ip/port/password/method/protocol/obfs/obfsParam/protocolParam/udpRelay/route/lanOpen/customTun/...）；
  - Android：直接通过 JS 传入完整 Profile，由模块内部处理（避免依赖宿主 App 的 `MainApplication`）；
  - iOS：转交给 `Manager` 或内部 Pod 的 API。
- `stop(): Promise<boolean>`
- `status(): Promise<{ connected: boolean; detail?: any }>`
- `addListener(event: 'state' | 'traffic', handler)` 可选，映射到 Android AIDL 回调；

新增测速 API（避免显式走本地 SOCKS5）
- 设计目标：既能评估“节点链路表现”，又避免“显式设置 SOCKS5 代理”的额外开销与污染。
- API 提案：
  - `speedTest(config: SSRConfig, options?: { url?: string; timeoutMs?: number; parallel?: number; through?: 'tunnel' | 'direct' | 'auto' }): Promise<{ mode: 'tcping'|'http'; latencyMs: number; httpCode?: number; bytes?: number }>`
    - `through` 含义：
      - `tunnel`：通过已建立的系统级 VPN/TUN 路由进行 HTTP 测试（JS/原生不显式设置 SOCKS），流量自然进入 TUN -> tun2socks -> ss-local。
      - `direct`：绕过 VPN/TUN，直连公网测速（基线网络），用于对比。Android 通过 `VpnService.protect(fd)` 保护 Socket；iOS 受限于 NE，通常需规则层面放行或不在 VPN 激活时执行。
      - `auto`：如果该节点正被激活为当前 VPN，走 `tunnel`；否则退化为 `tcping`（见下）。
    - 行为细分：
      - 当 `through=tunnel` 且该节点已接管流量：发起普通 HTTP 请求到 `url`（默认 `https://www.gstatic.com/generate_204`），不配置任何代理；统计 `connect+TTFB` 或完整耗时；
      - 当 `through=direct`：主动绕过 VPN 直连同一 `url`；
      - 当无法/不希望启用 VPN 切换该节点时：执行 `tcping` 到 `config.host:config.port`（三次握手时延），不走 SOCKS；
    - 返回：`mode` 表示最终使用的是 `tcping` 还是 `http`；
- Android 实现要点：
  - `tunnel`：无需代理。当前工程的 VPN 路由由 `ShadowsocksVpnService` 生效，普通 OkHttp 请求会自动走 TUN。
  - `direct`：在底层 Socket 上调用 `protect`（可封装 OkHttp 的 SocketFactory/ConnectionSpec），确保连接不入 TUN；
  - `tcping`：复用现有 `top.tel.netdiag.TcpPing`，直接连 `host:port`。
- iOS 实现要点：
  - `tunnel`：在已连接场景使用普通 `NSURLSession` 即可（系统路由已被 PacketTunnel 接管）；
  - `direct`：受 iOS 路由机制限制，推荐在未连接状态下执行，或通过规则临时放行目标域名；
  - `tcping`：可以用 CFStream 直连 `host:port` 测三次握手耗时。
- 与 Clash/Mihomo 的差异说明：
  - Clash/Mihomo 的 URLTest 通常“经由代理链路”发起请求，我们提供同等能力（tunnel），但不强制显式 SOCKS（避免 JS 侧代理配置），并补充 `direct`/`tcping` 两种不经 SOCKS 的对照路径。

这样可将“配置来源与持久化”留在宿主 App，模块只负责“建立/维护/停止连接”。

## 四.1 Android 落地操作步骤（可直接执行）

目标：将当前 Android 端 SSR/TUN 能力抽为独立 RN 模块（示例名：`react-native-shadowsocksr`）。

一）初始化库骨架
- 在工作区新增目录：`packages/react-native-shadowsocksr`，并创建以下基础结构：
  - `packages/react-native-shadowsocksr/package.json`
  - `packages/react-native-shadowsocksr/src/index.ts`（导出 JS API：`prepare/start/stop/status/on`）
  - `packages/react-native-shadowsocksr/android/build.gradle`、`packages/react-native-shadowsocksr/android/src/main/AndroidManifest.xml`
- 将库声明为 RN 原生模块（Gradle 插件 `com.facebook.react` + `ReactPackage`/`NativeModule`）。

二）迁移 Java/Kotlin 源码与改包
- 从应用拷贝并改包到库（建议新包名：`com.example.ssr` 或 `com.reactnative.ssr`）：
  - 源：`apps/telescope-react-native/android/app/src/main/java/com/shadow/ssrclient/service/*` → 目的：`packages/react-native-shadowsocksr/android/src/main/java/com/example/ssr/service/*`
  - 源：`apps/telescope-react-native/android/app/src/main/java/com/shadow/ssrclient/activity/ShadowsocksRunnerActivity.kt` → 目的：库内同层 `activity` 包
  - 源：`apps/telescope-react-native/android/app/src/main/java/com/github/shadowsocks/*`（仅 utils、System、Traffic 相关必要子集）→ 目的：库 `com/example/ssr/support/*`
  - 源：`apps/telescope-react-native/android/app/src/main/java/com/reactnative/CalendarModule.kt` → 精简重命名为库的 `SSRModule.kt`（保留对外方法，导出名可为 `ShadowsocksR`，并提供 `TTManager` 兼容层，见下文）
- 将应用侧强耦合引用移除或替换：
  - `MainApplication.getCurrentProfile()` → 通过库 API 直接传入 Profile（见 AIDL/Intent 改造）
  - `app.updateAssets()` → 库在首次初始化时自行调用资源复制逻辑（参照现 `MainApplication.copyAssets()`）

三）AIDL/Service 传参与回调改造
- 将 AIDL 迁移到库并改包：
  - 源：`apps/telescope-react-native/android/app/src/main/aidl/com/reactnative/IShadowsocksService*.aidl` → 目的：`packages/react-native-shadowsocksr/android/src/main/aidl/com/example/ssr/IShadowsocksService*.aidl`
- 调整接口：
  - 现有 `use(int profileId)` 改为 `useProfile(in SSRProfile profile)`（`SSRProfile` 为 `Parcelable`，字段与 JS 透传保持一致）。
  - 若暂不改 AIDL，可保留 `use(1)` 约定，但需在库内提供 `setCurrentProfile(profile)` 的静态保存，避免依赖宿主 `MainApplication`。
- 回调透出到 JS：在 `ShadowsocksVpnService` 回调处，通过 `DeviceEventEmitter` 向 JS 发 `state/traffic` 事件；库的 `SSRModule` 在初始化时注册/注销 AIDL 回调。

四）资源、二进制与 NDK 源码迁移
- 资产与资源：将 `apps/telescope-react-native/android/app/src/main/assets/acl/*` 拷贝到库 `android/src/main/assets/acl/`；将 `R.array.bypass_private_route` 拷贝到库 `res/values/arrays.xml`。
- 预编译 SO：将 `apps/telescope-react-native/android/app/libs/<abi>/*.so` 迁至库 `android/src/main/jniLibs/<abi>/`，用于快速落地与回归验证。
- NDK 源码（必须一并迁移，避免仅复制 SO）：
  - 将 `apps/telescope-react-native/android/app/jni/**` 迁移到库 `android/src/main/jni/**`（包含 badvpn/tun2socks、shadowsocks-libev、pdnsd、libancillary、mbedtls、system.cpp 等）。
  - 将 `apps/telescope-react-native/android/app/src/main/cpp/**` 中涉及到的与核心相关源码迁移；`libchang` 可评估后移除（参见“NDK 与 libchang 可移除性评估”）。
- 构建选项：
  - A（快速验证）仅使用预编译 SO，保证功能回归；
  - B（正式方案）在库中启用 externalNativeBuild（CMake/ndkBuild），提供“全量从源码构建”管线，确保 SO 有源可依：
    - 为 `libsystem.so` 配置 CMake 构建（源自 `jni/system.cpp`）；
    - 为 badvpn、shadowsocks-libev、pdnsd 等在库中配置独立 CMakeLists 或使用现有上游 CMake/Android.mk，产出与当前名称一致的 so；
    - 如遇第三方工程需单独工具链或补丁，可在库 `android/build.gradle` 中通过 flavor/task 引入构建脚本（保持默认仍可用预编译 SO）。
- 首次运行复制：在库初始化或 `prepare()` 时执行“将 assets/acl 与生成/预置二进制权限设置写入 data 目录”的逻辑（复用 `IOUtils.copy` 与 `chmod` 片段）。

五）Manifest 与权限
- 在库 `AndroidManifest.xml` 声明：
  - `<service android:name=".service.ShadowsocksVpnService" android:permission="android.permission.BIND_VPN_SERVICE" android:exported="true"/>`
  - `<activity android:name=".activity.ShadowsocksRunnerActivity" android:exported="false"/>`
- 保持应用 Manifest 仅需合并权限与 `uses-feature`（由库清单合并提供）。

六）Gradle 精简
- 库不引入应用层插件：删除（或不添加）`stringfog`、`android-junk-code`、`vasdolly`、`newrelic` 等与功能无关插件。
- `abiFilters` 覆盖 `armeabi-v7a, arm64-v8a, x86, x86_64`；启用 `aidl/buildConfig`。
- externalNativeBuild：在库 `android/build.gradle` 中开启 CMake/ndkBuild，并指向库内 `src/main/jni` 的 CMakeLists/Android.mk；默认提供“仅预编译 SO”与“源码构建”两种构建 profile（如 `-PbuildNativeFromSource=true`）。

七）JS Bridge 与兼容层
- 在库 `SSRModule.kt` 暴露：`prepare/start/stop/status`，并发送 `state/traffic` 事件。
- 兼容旧接口（可选）：额外导出名为 `TTManager` 的模块，方法映射：`startVService(map)` → `start(profile)`；`stopVService()` → `stop()`；`getServiceStatus()` → `status()`。
- 应用更新点：将 `src/utils/vpn/vpnStart.android.ts` 等调用从 `NativeModules.TTManager.*` 切换到新模块，或依赖兼容层无需改动。

八）验证
- 构建库 + 应用：`cd apps/telescope-react-native/android && ./gradlew :app:assembleDebug`
- 运行最小用例：调用 `prepare()`（若返回需弹窗则唤起 `ShadowsocksRunnerActivity`）→ `start()`，观察服务日志、AIDL 回调与 `TrafficUpdated` 事件。

四.2）so 源码自动编译策略（频繁修改场景）

目标：在新的 RN 模块中支持“修改 native 源码后，Android 构建自动增量重编译 SO”，避免手动命令干预。

方案概览：
- 在库模块启用 `externalNativeBuild`（CMake 或 ndkBuild），将 badvpn/shadowsocks-libev/pdnsd/libsystem 等源码纳入同一构建图。
- 在 Debug 构建默认“从源码构建”，Release 默认为“使用预编译 SO”，并可通过 Gradle 属性切换。
- Gradle/AGP 能感知 `CMakeLists.txt` 与源码变更，触发 `externalNativeBuild<Variant>` 任务增量重编译；Android Studio 启动/`./gradlew assembleDebug` 会自动带动重编译。

目录建议（库内）：
- `android/src/main/jni/`：
  - `badvpn/`、`shadowsocks-libev/`、`pdnsd/`、`libancillary/`、`mbedtls/`、`system/`（含 `system.cpp`）
  - `CMakeLists.txt`（顶层），按需 `add_subdirectory(...)` 或 `ExternalProject_Add(...)`
- `android/src/main/jniLibs/<abi>/`：预编译 SO（仅用于 Release 或快速回归）

Gradle 配置示例（库 `android/build.gradle`）
```
android {
  ndkVersion rootProject.ext.ndkVersion

  defaultConfig {
    // 让 CMake 使用多 ABI 输出
    externalNativeBuild {
      cmake {
        arguments "-DANDROID_STL=c++_shared"
        cppFlags "-O2 -fexceptions -frtti"
      }
    }
    // 可选：限制/指定 abiFilters
    ndk { abiFilters 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64' }
  }

  // 开启 CMake 构建
  externalNativeBuild { cmake { path file("src/main/jni/CMakeLists.txt") } }

  // Debug 默认从源码构建；Release 默认走预编译 SO
  buildTypes {
    debug {
      // 标记：Debug 强制从源码构建
      buildConfigField "boolean", "NATIVE_FROM_SOURCE", "true"
    }
    release {
      // 可通过 -PnativeFromSource=true 切换
      buildConfigField "boolean", "NATIVE_FROM_SOURCE", 
        project.hasProperty('nativeFromSource') && project.property('nativeFromSource') == 'true' ? "true" : "false"
      // 也可在这里附加 -D 传给 CMake 控制裁剪/优化
    }
  }

  // 动态切换是否打包预编译 jniLibs（避免与源码产物冲突）
  sourceSets {
    main {
      def usePrebuilt = !BuildConfig.NATIVE_FROM_SOURCE
      // 在库模块中无法直接访问 BuildConfig，通常使用 Gradle 属性/变体名来判断：
      // 例如：usePrebuilt = (project.hasProperty('nativeFromSource') ? project.property('nativeFromSource') != 'true' : (gradle.startParameter.taskNames.join(' ').contains('Release')))
      // 简化文档：建议用 Gradle 属性控制：
      jniLibs.srcDirs = (project.hasProperty('nativeFromSource') && project.property('nativeFromSource') == 'true') ? [] : ["src/main/jniLibs"]
    }
  }
}
```

CMake 顶层示例（库 `android/src/main/jni/CMakeLists.txt`）
```
cmake_minimum_required(VERSION 3.22)
project(ssr_native)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 17)

# 1) libsystem.so（JNI：getABI/sendfd/jniclose）
add_library(system SHARED system/system.cpp)
target_link_libraries(system log)

# 2) badvpn/tun2socks：建议保持与工程现有开关一致
add_subdirectory(badvpn) # 子目录需包含自身 CMakeLists，产出 libtun2socks.so

# 3) shadowsocks-libev（含 SSR 扩展）：
add_subdirectory(shadowsocks-libev) # 产出 libss-local.so（或对应目标名）

# 4) pdnsd
add_subdirectory(pdnsd) # 产出 libpdnsd.so

# 如上游不提供 CMake，可用 ExternalProject_Add 或自写 CMakeLists 汇总源码
```

构建/触发与增量
- 自动触发：
  - 修改 `src/main/jni/**` 任何源码或 `CMakeLists.txt` 后，下一次执行 `./gradlew :app:installDebug`、`assembleDebug` 或从 Android Studio 运行，会触发 `externalNativeBuild<Variant>` 增量重编译。
  - React Native 的 `run-android` 本质调用 Gradle 安装任务，同样会触发。
- 增量与缓存：
  - AGP/Gradle 会基于输入文件时间戳判断是否需要重编译，CMake 产物位于模块的 `intermediates/cxx/` 目录；
  - 切换“预编译 SO/源码构建”模式时，建议执行一次 `./gradlew clean` 以规避缓存干扰。

注意事项
- 多工程合并：badvpn、shadowsocks-libev、pdnsd 有独立上游构建脚本。若直接 `add_subdirectory` 不可用，可采用 `ExternalProject_Add` 调用其自有 CMake/Autotools，再将产物 `add_library(... IMPORTED)` 引入当前目标。
- 可执行共享库：现工程以“可执行共享库”方式运行 `ss-local/tun2socks/pdnsd`。自编译时需保持目标名与导出入口一致，确保以现有命令行参数启动可正常工作。
- ABI 一致性：确保 `abiFilters` 与应用一致；同时安装多 ABI 设备时要有对应产物。
- NDK 版本：与顶层工程 `ndkVersion` 对齐（当前见 android/gradle.properties 或根扩展），避免 C++ STL/ABI 不兼容。

结论
- 可以在新的 RN 模块中实现“so 源码改动后自动重编译”。实践路径是：Debug 走源码构建、Release 默认走预编译 SO，通过 Gradle 属性一键切换；借助 AGP/ExternalNativeBuild 的增量机制，常规 run/build 会自动触发 native 重编译，无需手动命令。

## 四、Android 模块化方案（可行）

改造要点：
1) 代码迁移与包名策略（已落地）
- 将以下包迁移到库：`com.shadow.ssrclient.*`、`com.github.shadowsocks.utils.*`（必要子集）、AIDL 接口、`GuardedProcess*`、`ShadowsocksRunnerActivity`、`ShadowsocksVpnService`、`ShadowsocksVpnThread`、`Profile` 等；
- 为保证最终 APK 差异最小，核心实现类“保持原包名不变”（如 `com.shadow.ssrclient.service.*`）。仅新增 RN Bridge 使用独立包名（如 `com.example.ssr`），AIDL 包名保留 `com.reactnative` 以降低 JS 改动；
- 移除对 `com.reactnative.MainApplication` 的直接引用：
  - 运行时上下文通过 `Context` 注入；
  - 埋点/监控去除或通过接口回调上抛给 JS；
  - `getCurrentProfile()` 改为“JS 透传 Profile 到 Service（Parcelable）”。

2) AIDL/Service 交互收敛
- 现有 `IShadowsocksService.use(int profileId)` -> 改为 `useProfile(Bundle/Parcelable profile)`（AIDL 支持 `in Parcelable`）；
- 或者绕过 AIDL：由 RN 模块直接 `startService(Intent)` 携带序列化 Profile，Service onStartCommand 中取用；绑定仅用于回调与状态查询。

3) 资源与二进制打包
- 将 `android/app/libs/*/*.so` 迁移至库的 `android/src/main/jniLibs/<abi>`；
- 将 `assets/acl/*.acl` 等迁入库 `android/src/main/assets/acl`，由库在运行时复制到 data 目录；
- `R.array.bypass_private_route` 迁入库的 `res/values/arrays.xml`；
- 保留 `com.github.shadowsocks.System` 与 `libsystem.so` 的 JNI 对应关系。

4) Manifest/权限与引导
- 组件声明保持在宿主清单中（`ShadowsocksVpnService`、`ShadowsocksRunnerActivity` 等），库清单仅保留占位 `<application/>`，避免重复声明导致合并冲突；
- `VpnService.prepare` 的引导由库提供方法（`prepare()`）返回“是否需弹窗”，具体弹窗由宿主拉起 RunnerActivity。

5) Gradle/NDK 精简
- 移除与功能无关的混淆与字符串加密插件（stringfog、junk-code、新遗留配置），保持库构建最小闭包；
- 如无需要，可去掉 `libchang.so` 的 CMake 构建，仅保留必须的 JNI SO；
- `abiFilters` 覆盖 `armeabi-v7a/arm64-v8a/x86/x86_64`（当前已具备二进制）。

6) JS Bridge
- 在库内提供 RN Package 与 Module（例如 `SSRModule`，导出名 `ShadowsocksR`），实现 `prepare/start/stop/status`；
- 兼容旧调用：可提供一层 `TTManager` 兼容适配，或者在应用侧改动调用点。

复杂度评估：中等偏上。主要工作量在“去 MainApplication 化”“AIDL/Intent 传参改造”“资源/二进制搬迁与验证”。预计 2–3 天完成初版整合 + 1–2 天联调与修修补补。

NDK 与 libchang 可移除性评估
- 现状：CMake 构建 `libchang.so`（源自 `app/src/main/cpp/native-lib.cpp`、`Rijndael.*`），但 Java/Kotlin 未发现 `System.loadLibrary("chang")` 或任何 JNI 符号调用；
  - 检索：未检出对 `libchang` 的加载或 JNI 方法签名引用；
  - 结论：`libchang` 未被使用，属于构建冗余。
- 风险评估与处置：
  - 可在库化过程中移除 `externalNativeBuild/cmake` 与 `cpp` 源文件，保留与 VPN 相关的预编译 SO 与必要 JNI（`libsystem.so`/`System.sendfd`）；
  - 验证步骤：移除后完整构建 Debug/Release，运行 VPN 连接、测速、UDP 监听等关键路径，确认无崩溃与找不到符号；
  - 回滚策略：如出现未知依赖，可恢复 `externalNativeBuild` 配置或仅保留空目标以满足旧脚本。

## 五、iOS 模块化方案（可行但复杂）

两种路径：
1) 完整抽离为 Pod（推荐长期方案）
- 将 `ShadowLibrary/Manager.swift`、`PacketTunnel/*`（含 `tun2socks`、`socksclient`、`ProxyManager` 等 C/ObjC/Swift 代码）抽为独立 CocoaPod（例如 `ShadowsocksRKit`）；
- 在 Podspec 中提供：
  - 主应用集成的源文件与资源；
  - 一个 subspec 或脚本，帮助宿主工程创建/集成 PacketTunnel Extension Target（需自定义 `post_install` 脚本或提供示例模板）；
- RN 模块 `react-native-shadowsocksr` 以该 Pod 为依赖，提供 `TTManager` 等 JS Bridge；
- 宿主 App 仍需手工配置：Network Extensions 能力、App Group、签名与 Provisioning Profile、Info.plist 中 NE 配置；
- 验证链路：`Manager.switchVPN`、`PacketTunnelProvider`、`TunnelInterface` 与 `ProxyManager` 的联动。

2) 轻量包装（短期可用）
- 保持 iOS 现状在 App 工程；`react-native-shadowsocksr` 仅抽离 JS 层与 Android 侧；
- iOS 直接 peer-dependency 到现有 Shadow 代码（或通过 git submodule），RN 模块只导出统一 API 并转调原实现；
- 成本低但未实现 iOS 彻底解耦。

复杂度评估：高。难点在于：
- PacketTunnel Extension 无法由 Pod 自动创建签名与 Entitlements，必须由宿主工程参与配置；
- 现有文件/Target/Workspace 组织较为定制化，抽离需要理顺编译依赖与路径；
- 预计 1–2 周完成 Pod 化与文档/示例工程，含真机签名调试。

## 五.1 iOS 落地操作步骤（优先文档化 + 示例）

目标：在不破坏现工程可运行性的前提下，沉淀可复用的 Pod 与 RN 模块边界。

一）拆分可复用代码为 Pod（长期方案）
- 新建 Pod 工程 `ShadowsocksRKit`：
  - 源包含：`ShadowLibrary/Manager.swift`、`PacketTunnel/*`、`Shadow/*` 中与 VPN 直相关的 ObjC/Swift/C 源文件与资源（如 `default.acl`）。
  - Podspec 暴露主 App 侧 API（`Manager`/`TTManager` 依赖）、以及一个提供 PacketTunnel Target 模板的 subspec 或脚本（`post_install` 生成/校验 Extension Target）。
- 在 RN 模块 `packages/react-native-shadowsocksr` 的 `ios/` 目录提供 `RNSSRModule.m/.swift`，桥接 `setProxyMode/connectVPN/stopVPN/vpnStatus` 到 `ShadowsocksRKit`。

二）短期可用（先行方案）
- 保持 iOS 代码留在 App 工程：RN 模块仅提供 JS API 与 Android 能力；iOS 侧 `TTManager` 继续原地使用。
- 编写“接入指南”而非强行抽离：
  - 开启能力：在主 App Target 与 PacketTunnel Target 打开 Network Extensions、配置 App Groups；
  - Info.plist：为 `NETunnelProviderProtocol` 填写 `providerBundleIdentifier`，并在主 App 内通过 `Manager` 下发 `providerConfiguration`；
  - 资源部署：保证 `default.acl`、GEOIP 数据按 `Manager.copyGEOIPData()` 的期望可达；
- 示例：提供最小示例工程以演示 `setProxyMode/connectVPN/stopVPN/vpnStatus` 的调用链与签名设置。

三）验证
- 使用 Xcode 选择主 App 与 PacketTunnel 均可签名的 Team/Profiles，首次安装需手动在“设置→VPN”允许配置；
- 连接后抓取日志（可在 `PacketTunnelProvider`、`TunnelInterface`、`ProxyManager` 关键路径打印），核对 TCP/UDP/DNS 行为与规则命中；

## 六、兼容性与运行时要点
- Android：
  - 权限：`BIND_VPN_SERVICE`；Android 10+ 的后台启动限制需注意引导流程与前台通知；
  - FD 保护：`ShadowsocksVpnThread` 通过 LocalSocket 接收 FD 并 `vpnService.protect(fd)`，保持现状；
  - 资源复制：首次运行需将 ACL 等资产写入 `dataDir`；
  - 事件回调：AIDL 线程模型与 RN 线程通信需要注意（主线程派发）。
- iOS：
  - 必须具备 Network Extensions 权限；
  - 审核与合规风险需评估；
  - App 与 Extension 的通信与配置（如代理模式、规则）需通过共享容器或 `NETunnelProviderProtocol` 的 `providerConfiguration` 下发。

## 七、测试策略与计划

现状与风险
- 现状：项目缺乏系统的单元测试与集成/E2E 测试，模块化后回归保障不足。
- 风险：VPN 连接、路由分流、DNS 解析与流量统计在多设备/多 ABI 场景下容易发生回退且难以及时发现。
- 目标：建立“单元 + 集成 + 端到端（E2E）”的分层测试体系，最先覆盖连接测试、路由规则测试、DNS 解析测试、流量统计测试四大类核心能力。

分层与目录（建议）
- JS 单元：`apps/telescope-react-native/src/**/__tests__/**/*.(test|spec).ts`
- Android 单元：`apps/telescope-react-native/android/app/src/test/java/**`
- Android 集成/仪器：`apps/telescope-react-native/android/app/src/androidTest/java/**`
- iOS 单元/集成：`ios/*Tests`（后续 Pod 化时迁移至模块内）

执行命令（CI 入口）
- JS：`cd apps/telescope-react-native && yarn test`
- Android 单元：`cd apps/telescope-react-native/android && ./gradlew :app:testDebugUnitTest`
- Android 集成：`cd apps/telescope-react-native/android && ./gradlew :app:connectedDebugAndroidTest`
- iOS（本地验证）：`xcodebuild -scheme <AppScheme> -destination 'platform=iOS Simulator,name=iPhone 15' test`

注意：Android 集成测试涉及 VPN 授权。建议在测试用例首步自动拉起 `ShadowsocksRunnerActivity` 完成授权（UiAutomator 点击“允许”），或在本地/CI 预先完成一次授权后再跑用例。

七.1 连接测试（Android）
- 用例目标：验证 RN → 原生 → Service → 本地进程链路可成功建立，状态回调与错误处理正确。
- 前置准备：
  - 提供可达的测试服务器（建议在开发机本地或 CI 起一个 SSR/SS 模拟端，真机通过 `10.0.2.2`/`host.docker.internal` 访问）。
  - 构造最小 Profile（host、port、password、method、protocol/obfs 可留空或按后端配置）。
- 步骤与断言：
  1) 调用 JS `prepare()`，断言返回 true；
  2) 调用 JS `start(profile)`，等待状态进入 CONNECTED（可订阅事件或轮询 `status()`）；
  3) 通过 OkHttp 访问一个 HTTP 接口，断言 200/超时行为符合预期；
  4) 读取 AIDL 回调的 `trafficUpdated`，确认非零增长；
  5) `stop()` 后状态为 DISCONNECTED，守护进程退出。
- 示例（仪器测试骨架，Kotlin）：
  ```kotlin
  // 文件：android/app/src/androidTest/java/com/example/ssr/ConnectionTest.kt
  @RunWith(AndroidJUnit4::class)
  class ConnectionTest {
      @Test fun connectAndFetch() {
          val ctx = InstrumentationRegistry.getInstrumentation().targetContext
          // 1) 触发授权引导（如未授权）
          ctx.startActivity(Intent(ctx, ShadowsocksRunnerActivity::class.java).addFlags(FLAG_ACTIVITY_NEW_TASK))
          // 2) 启动服务（通过 RN Module 或直接 Intent 携带 Parcelable Profile）
          val ok = SSRTestHelpers.startServiceWithProfile(ctx, TestProfiles.minimal())
          assertTrue(ok)
          // 3) 访问网络
          val code = SSRTestHelpers.httpGet("http://10.0.2.2:8080/health")
          assertEquals(200, code)
          // 4) 流量校验
          val stat = SSRTestHelpers.awaitTraffic()
          assertTrue(stat.rx + stat.tx > 0)
          // 5) 停止服务
          SSRTestHelpers.stopService(ctx)
      }
  }
  ```

七.2 路由规则测试（Android）
- 目标：验证不同路由模式与 ACL 命中行为（直连/代理/封锁）。
- 单元层（推荐先落地）：
  - 抽出规则匹配核心为纯 Kotlin 工具类（例如 `RouteMatcher`），输入域名/IP/GeoIP 与 ACL 片段，输出路由决策。
  - 用例集：
    - 域名直连：`bypass_list` 命中直连；
    - 域名代理：`proxy_list` 命中代理；
    - 域名封锁：`outbound_block_list` 命中封锁；
    - IP 决策：命中 `bypass_private_route` 与公有网段；
    - GeoIP：CN IP 直连、非 CN 代理。
- 集成层：
  - 以不同 Profile.route（ALL/BYPASS_CHN/ACL/CHINALIST）与不同 ACL 下发组合启动；
  - 断言点：
    - `ss-local` 启动参数包含 `--acl <xxx.acl>`；
    - `pdnsd` 生成的配置是否包含 `[remote_dns]`（当 ACL 指明远端解析时）；
    - 访问一组测试域名，观察可达性与延迟差异（代理域名应经代理可达，封锁域名应失败）。
- 示例（单元，Kotlin 伪码）：
  ```kotlin
  @Test fun routeMatcher_basic() {
      val acl = load("bypass-lan-china.acl")
      val m = RouteMatcher(acl)
      assertEquals(Decision.BYPASS, m.decideDomain("miwifi.com"))
      assertEquals(Decision.PROXY, m.decideDomain("youtube.com"))
      assertEquals(Decision.BLOCK, m.decideDomain("blocked.example"))
      assertEquals(Decision.BYPASS, m.decideIp("192.168.1.1"))
  }
  ```

七.3 DNS 解析测试（Android）
- 目标：验证 `udpdns=true/false` 与 ACL `[remote_dns]` 组合下的解析走向与结果一致性。
- 方法 A（黑盒集成，推荐）：
  - 搭建两个可控 DNS：本地 DNS（返回 A=1.1.1.1）与远端 DNS（返回 A=2.2.2.2），对同一测试域名给出不同结果；
  - 配置 Profile：
    - 情形 1：`udpdns=false` + ACL 含 `[remote_dns]` → 期望解析走远端，返回 2.2.2.2；
    - 情形 2：`udpdns=false` + 无 `[remote_dns]` → 期望本地解析，返回 1.1.1.1；
    - 情形 3：`udpdns=true` → 期望经 UDP 隧道远端解析，返回 2.2.2.2；
  - 断言：在仪器测试中用 `InetAddress.getAllByName(testDomain)` 或通过 HTTP(SNI) 发起到 `http://<domain>/health`，比对命中的 IP。
- 方法 B（白盒佐证）：
  - 检查生成的 `pdnsd` 配置文件与 `tun2socks --dnsgw` 参数；
  - 解析阶段抓取日志关键字（如 `pdnsd: querying remote`）。

七.4 流量统计测试（Android）
- 目标：验证 `ShadowsocksVpnService`（或 AIDL 回调）统计的字节数与真实传输相符，覆盖 TCP 与 UDP。
- 方法：
  - 使用 OkHttp 的 `MockWebServer`（或开发机本地 HTTP 服务器）按固定大小回包（如 64KB）；
  - 用例 1（TCP）：下载固定大小资源，断言 `rx`/`tx` 至少达到阈值（考虑头部开销留 5–10% 余量）；
  - 用例 2（UDP）：向测试 UDP 服务发送固定大小报文 N 次，断言统计量增长；
  - 边界：连接中断/重连后统计重置与累计策略正确（测试 `stop()`/`start()` 连续切换）。
- 示例（伪码）：
  ```kotlin
  @Test fun traffic_counting_tcp() {
      SSRTestHelpers.startWith(TestProfiles.minimal())
      val bytes = SSRTestHelpers.httpDownload("http://10.0.2.2:8080/64k.bin")
      val stat = SSRTestHelpers.awaitTraffic()
      assertTrue(stat.rx >= 60 * 1024) // 预期至少 60KB
  }
  ```

七.5 JS 层 API 与 E2E
- 目标：确保 JS API 行为稳定，模块化后不破坏应用侧逻辑。
- JS 单元：对 `prepare/start/stop/status` 做参数校验与错误分支测试（Jest）。
- E2E（可选）：使用 Detox 启动 App，调用 JS API 建连/断开，观测状态与简单网络请求成功。

七.6 iOS 对应测试（概览）
- 单元：`Manager.switchVPN`、`ProxyManager` socks 端口回传、规则匹配（NEKit Rule）与配置生成。
- 集成：启动 PacketTunnel 后发起 HTTP 请求验证连通性；解析规则用一组测试域名验证直连/代理分流。
- 执行：`xcodebuild -scheme <AppScheme> -destination 'platform=iOS Simulator,name=iPhone 15' test`（注意：某些 VPN 能力需真机）。

七.7 CI 集成建议
- Android GitHub Actions（示例要点）：
  - 拉起 emulator（API 30+），预装测试 APK，首次运行手动/脚本完成 VPN 授权；
  - 执行 `:app:testDebugUnitTest` 与 `:app:connectedDebugAndroidTest`；
  - 发布 JUnit XML 报告与失败时的日志（收集 `logcat`、Service 日志文件、`pdnsd`/`ss-local` 启动参数）。
- 产物与覆盖率：Jacoco 统计 Android 单元/仪器测试覆盖率；JS 使用 `--coverage` 输出 LCOV。

七.8 里程碑与优先级
- P0：连接测试、流量统计测试（基础保障）。
- P1：路由规则测试、DNS 解析测试（分流正确性）。
- P2：JS E2E 与 iOS 覆盖（完善跨平台一致性）。

落地改动（最小集）
- 新增测试辅助类 `SSRTestHelpers`（封装：授权引导、启动/停止、状态等待、HTTP/UDP 工具、统计获取）。
- 抽取 `RouteMatcher` 纯 Kotlin 工具，允许无需启动 VPN 即可验证 ACL 决策。
- 在 Service 端加少量日志与可观测性（如输出 `ss-local`/`pdnsd` 启动参数、ACL 命中统计），仅在 Debug 变体启用。

## 八、风险与限制
- 法规与审核：SSR/VPN 在上架渠道存在合规风险（iOS 尤甚）；
- 宿主改造成本：iOS 需修改签名与能力，Android 需合并 Manifest；
- 二进制来源与升级：`ss-local/tun2socks/pdnsd` 升级策略与安全性；
- 设备兼容：国产 ROM 对 VPNService/本地 Socket 的政策差异；
- 现有强耦合点去除带来的改动面（MainApplication、埋点等）。

## 九、实施计划（建议）
1) 第一阶段（Android 抽离，3–5 天）
- 建库 `packages/react-native-shadowsocksr`，整理 JS API；
- 迁移 Android 代码与资源，去耦 `MainApplication`，改造传参；
- 完成 Manifest/打包/jniLibs 整合与 Demo 验证；

2) 第二阶段（iOS 方案 A/B，1–2 周）
- A（完整 Pod 化）：抽取 Shadow/PacketTunnel 为 Pod，提供示例与文档；
- B（短期包装）：保留 iOS 现状，RN 模块仅统一 API（不彻底解耦），优先确保 Android 上线；

## 十、APK 等价性验证（与 Telescope_WC_v3.2.0.apk 对比）

目标
- 确认模块化后 APK 与参考包在“清单/组件/权限、原生库、资源、关键类与 API 行为”上一致；在具备相同签名与构建参数的前提下，力争达到字节级一致。

参考与产物
- 参考包：`apps/telescope-react-native/Telescope_WC_v3.2.0.apk`
- 新包：`apps/telescope-react-native/android/app/build/outputs/apk/release/app-release.apk`（或 Debug 包）

一键对比脚本
- 执行：`bash scripts/apk-compare.sh apps/telescope-react-native/Telescope_WC_v3.2.0.apk apps/telescope-react-native/android/app/build/outputs/apk/release/app-release.apk`
- 输出：
  - 基本信息（包名/版本/SDK/权限/组件）；
  - `assets/` 与 `lib/**/*.so` 的 sha256 列表与差异；
  - 解码后的 `AndroidManifest.xml` 差异摘要；
  - 类与包分布（可选，需安装 jadx/apktool）。

手动对比要点
- aapt 基本信息：
  - `aapt dump badging <apk>` 比对 `package`、`versionCode`/`versionName`、`sdkVersion/targetSdkVersion`、`uses-permission`、`application-label`、`launchable-activity`；
- Manifest/组件（apktool）：
  - `apktool d -f -o out <apk>`，比对 `AndroidManifest.xml` 中的 `service/activity/receiver/provider/intent-filter`；
- 资源与资产：
  - `diff -r out_old/assets out_new/assets`（重点校验 `assets/acl/*.acl`）；
  - 资源内容（布局/Xml）以解码文本比对（id 不一致不视为问题）；
- 原生库：
  - `find lib -type f -name "*.so" -exec sha256sum {} + | sort` 对比两侧哈希；
- 代码/类（可选）：
  - `jadx -d classes_* <apk>` 导出源码，统计类数与关键包（`com.shadow.ssrclient.*`、`com.reactnative.*`、`com.example.ssr`）。

判定标准
- 字节级一致：除 `META-INF/*`（签名）外文件内容一致（zip 对比/zipcmp 通过）。
- 结构一致：清单/组件/权限一致；`assets` 与 `lib/*.so` 一致；类分布一致，仅新增 RN 桥接包 `com.example.ssr`。
- 功能一致：按“七、测试策略与计划”中的 Android E2E 用例全部通过。

构建注意
- 若需字节级一致，请使用与参考包一致的 keystore（别名/口令一致）、AGP/NDK/R8 版本与配置；
- 默认建议：Release 使用预编译 SO（`-PnativeFromSource=false`），避免因 NDK 源码编译产生二进制差异；
- 切换“源码/预编译”模式前建议 `./gradlew clean` 以规避缓存干扰。

## 十一、iOS 侧说明与 ICSMainFramework 评估

现状与结论
- SSR 实现（PacketTunnel、ShadowLibrary、ShadowBase、资源）已迁至 `packages/react-native-shadowsocksr/ios`；宿主 `ios` 目录不再保留 SSR 具体实现。
- `ICSMainFramework` 是宿主的应用框架层（`AppDelegate`/UI/环境初始化等），在 `AppDelegate.swift`/`AppInitializer.swift`/`NotificationHandler.swift` 等仍被继承与引用；与 SSR 能力无直接耦合，故不应迁入 SSR 库。
- 若业务确认不再需要该框架，可在后续将宿主的 `AppDelegate` 改回原生实现并移除 `ICSMainFramework` 依赖；本次 SSR 模块化不强制处理。

接入要点
- Pod 侧通过 `ShadowsocksR/full` 子规格引入 SSR 能力（含 PacketTunnel 与资源）；
- 确保 App Group/Entitlements 与库内约定一致；
- 清理 Xcode 工程中已删除的旧 SSR 文件的 PBX 引用，避免“找不到文件”编译错误。

3) 文档与示例
- Output：最小 Demo（JS + Android）、集成手册（权限、清单、API）、iOS 签名与能力配置说明。

## 十、结论
- Android：完全可行，工作量可控。通过“去 MainApplication 化 + AIDL/Intent 改造 + 资源/二进制打包”，即可沉淀为通用库。
- iOS：技术可行但工程化复杂，需要 Pod 化与宿主工程配合（签名/Entitlements/Extension 目标）。若以“Android 先行、iOS 分步推进”为策略，风险最小、收益清晰。

---

附录 A：现有二进制/NDK 组件与源码回溯

Android 侧组件与对应源码位置/上游参考：
- tun2socks
  - 已有源码：`android/app/jni/badvpn/*`（包含 `tun2socks/tun2socks.c`、`lwip`、`socksclient`，且实现了 `--sock-path` 选项，与现运行时参数一致）
  - 上游参考：`ambrop72/badvpn`；Shadowsocks-Android 早期在其仓库的 `core/src/main/jni/badvpn` 有 Android 定制补丁，可作为补充参考
- libsystem（JNI：sendfd/jniclose/exec/getABI）
  - 已有源码：`android/app/jni/system.cpp`，Java 封装在 `com.github.shadowsocks.System`
  - 上游参考：`shadowsocks/shadowsocks-android` 的 core 模块 JNI 实现
- ss-local（ShadowsocksR 变体）
  - 已有源码：`android/app/jni/shadowsocks-libev`，可见 `src/includeobfs.h`、`src/obfs/*`、`src/protocol.h` 表明包含 SSR 协议/混淆扩展
  - 上游参考：`shadowsocksrr/shadowsocksr-libev`（社区归档版本）或 `shadowsocksR-Live/shadowsocksr-libev`（镜像/延续维护）
- pdnsd（Android 端用于本地域名解析）
  - 已有源码：`android/app/jni/pdnsd/*`（含 `src/android.c` 等）
  - 上游参考：`shadowsocks/pdnsd-android`（Android 移植/脚本），以及 pdnsd 原作者项目文档
- libancillary（Unix 域套接字 FD 传递）
  - 已有源码：`android/app/jni/libancillary/*`（README 指向原作者站点）
  - 上游参考：`https://www.normalesup.org/~george/comp/libancillary/` 或 GitHub 镜像（如 willemt/libancillary）

iOS 侧组件：
- tun2socks（iOS 移植，内置 lwIP 与 socksclient）
  - 已有源码：`ios/PacketTunnel/tun2socks-iOS/*` 与 `ios/PacketTunnel/TunnelInterface.*`
  - 上游参考：基于 badvpn/tun2socks 的 iOS 适配实现，可对照 `zhuhaow/tun2socks`、Surge 等早期项目思路
- ss-local 启动/端口回传：`ios/PacketTunnel/ProxyManager.m` 中 `start_ss_local_server`/`sock_port` 逻辑（C 接口来自内置库或 Pod，现工程已包含调用端）

版本识别说明：
- 工程内源码时间戳集中在 2023-09 与 2024-06/10，推测已融合近年的社区补丁；
- 若需严格对齐上游版本，可通过：
  - 对比 `tun2socks.c` 中参数与选项（如 `--sock-path`）在上游首次出现的提交；
  - 对比 `shadowsocks-libev/src` 目录下 SSR 扩展文件内容与各镜像仓库的提交哈希；
  - 编译生成的二进制符号或 `--help` 输出与上游构建产物逐项比对。

附录 B：Android/iOS SSR 转发与 DNS/分流工作方式（对比）

- Android 转发链路与 DNS
  - 核心链路：TUN(26.26.26.0/24) -> tun2socks(`--socks-server-addr 127.0.0.1:<localPort>`) -> ss-local(SSR 扩展) -> 远端服务器。
  - DNS 处理：
    - 若 `profile.udpdns = true`：
      - `ss-local` 以 `-u` 方式启动，`tun2socks` 开启 `--enable-udprelay`，UDP DNS 直接经 SOCKS/SSR 隧道转发到远端解析；
    - 若 `profile.udpdns = false`（默认）：
      - 启动 `pdnsd`（监听 `localPort+53`），并在 `tun2socks` 指定 `--dnsgw 26.26.26.1:<localPort+53>`；
      - 同时启动 `ss-local` 搭配 `-L <dns_ip>:<dns_port>`（隧道 DNS），由 `pdnsd` 决定 DNS 走向（直连或远程）。
  - 路由与分流：
    - `VpnService.Builder` 根据 `profile.route` 注入路由：
      - `ALL/BYPASS_CHN` 走 `0.0.0.0/0`；否则仅注入公有网段，并绕过私网；
      - 为保证解析，额外注入 `dns_address` 或 `china_dns_address` 的单 IP 路由（32）；
    - ACL 参与：当 `profile.route != ALL` 时，`ss-local` 加载 `--acl <dataDir>/<route>.acl`（例如 `bypass-china.acl`、`gfwlist.acl`、`bypass-lan-china.acl` 或 `default-server.acl`）；
    - DNS 本地/远程切换：`startDnsDaemon()` 会根据所用 ACL 是否包含 `[remote_dns]` 决定生成 `PDNSD_LOCAL` 或 `PDNSD_DIRECT` 模式，从而控制域名查询是在本地直连还是通过隧道远端解析；
  - 关键实现参考：
    - 转发与 tun2socks：`android/app/src/main/java/com/shadow/ssrclient/service/ShadowsocksVpnService.kt:585` 起；
    - DNS 逻辑：`startDnsDaemon()` 与 `startDnsTunnel()`；
    - ACL/路由：`assets/acl/*.acl` 与 `Route.*` 分支、`R.array.bypass_private_route`。

- iOS 转发链路与 DNS
  - 核心链路：PacketTunnel(NEPacketTunnelProvider) -> tun2socks(iOS) `--socks-server-addr <127.0.0.1:port>` -> ss-local(SSR)；
  - TCP：交由 tun2socks 通过本地 SOCKS 转发；
  - UDP：`TunnelInterface` 监听包流，对 UDP 包进行特殊处理（DNS 包由 `_stackManager`/NEKit 处理；非 DNS UDP 通过 `GCDAsyncUdpSocket` 转发），tun2socks 参数中未显式开启 `dnsgw/udprelay`；
  - DNS 处理：
    - 应用层发起的域名连接在 Tunnel 侧优先通过 NEKit 的 `Resolver` 本地解析（`DNSServiceGetAddrInfo`，参见 `NEKit/Tunnel/Tunnel.swift:152` 及 `NEKit/Resolver` 系列）；
    - lwIP 自身也初始化了 `dns_init()` 定时器（见 `tun2socks-iOS/lwip/src/core/init.c` 与 `timers.c`），结合 `_stackManager.readPacketWithPacket` 对 DNS 流量的识别处理，整体表现为“本地解析优先”；
    - `ProxyManager` 仅负责启动 `ss-local` 与回传本地 SOCKS 端口，未见 iOS 侧的 pdnsd/ss-tunnel；
  - 规则与分流：
    - 依赖 `ShadowLibrary` + NEKit 的规则系统：`default.acl` 与服务端动态下发规则被解析为 RuleManager 的规则集合（域名/IP/GEOIP 等），匹配后选择直连/代理；
    - 规则来源：
      - 本地默认：`ios/Shadow/default.acl`；
      - 远端配置：`HttpConfig.API_GFW_LIST` 等接口；
  - 关键实现参考：
    - 启动链路：`PacketTunnelProvider.m` 调 `ProxyManager.startShadowsocks` + `TunnelInterface.startTun2Socks`；
    - DNS/解析：`NEKit/Resolver/*.swift`、`Tunnel.swift:didReceive(session:)` 中的 Resolve 分支；
    - UDP 处理与 DNS 甄别：`TunnelInterface.m:125` 与 `dns.m`。

  - 域名分流能力与边界：
    - 能力：依托 NEKit 的 Resolver 与“域名会话（ConnectSession.host）”机制可进行基于域名的规则匹配（`RuleManager.match(session)`）；工程内亦存在 `default.acl` 与远端下发规则，支持 DOMAIN/IP/GEOIP 等；
    - 机制：通过拦截/解析 DNS 请求（含 Fake-IP 映射，见 `NEKit/Opt.swift:DNSFakeIPTTL` 等）或基于 HTTP Host/TLS SNI 的协议嗅探，建立“域名 → 连接”的关联，随后对 TCP 会话应用域名规则；
    - 限制：
      - 当应用使用 DoH/DoT 或硬编码 IP 直连、或命中系统缓存导致隧道侧拿不到 DNS 事务时，可能无法提取域名，退化为 IP/GEOIP 规则；
      - 某些加密/混淆协议可能阻断 SNI/Host 嗅探；
      - On-Demand 规则（`Manager.swift`）与系统策略也会影响触发时机；

- 结论（是否一致）：
  - 转发路径不完全一致：Android 以 tun2socks+ss-local 为核心，并通过 pdnsd/udprelay 灵活控制 DNS 本地/远端；iOS 倾向于在 Tunnel 侧进行本地解析（NEKit/Resolver），tun2socks 主要承接 TCP，UDP/DNS 由 PacketTunnel 层配合处理；
  - 分流策略在两端均可用：Android 借助 `--acl` 与 pdnsd 配置实现；iOS 通过 NEKit 规则系统实现。两者都能承载“直连/代理/封锁”三类域名与 IP 列表。

附录 C：分流策略来源与生成（服务端 AclBuildView）

- 服务端 `AclBuildView` 生成两类文件（指服务端规则构建脚本/服务，路径因部署而异）：
  - APP 侧 ACL（文件内容片段）：
    - `[bypass_all]`、`[outbound_block_list]`、`[bypass_list]`、`[proxy_list]`；
    - 来源表 `GfwAclList` 中 style=refuse/connection/proxy 的域名/IP/正则，依次写入；
  - ROUTER 侧路由规则：
    - 生成 `domain_rej|/domain_cn|/domain_proxy|` 与 `ip_rej|/ip_cn|/ip_proxy|` 形式，以及对域名正则的格式化；
- 与客户端对应关系：
  - Android：可将 APP 侧 ACL 下发后落盘到 `<dataDir>/<route>.acl`，配合 `ss-local --acl` 与 pdnsd `[remote_dns]` 开关进行域名层分流与解析策略控制；
  - iOS：将下发 ACL 融入 `ShadowLibrary`/NEKit 的规则系统，域名/IP/GEOIP 匹配后路由到直连或代理。

附录 D：Android 迁移清单（对照执行）
- 源代码：
  - `apps/telescope-react-native/android/app/src/main/java/com/shadow/ssrclient/**` → 库 `android/src/main/java/com/example/ssr/**`
  - `apps/telescope-react-native/android/app/src/main/java/com/github/shadowsocks/**`（必要文件）→ 库 `android/src/main/java/com/example/ssr/support/**`
  - `apps/telescope-react-native/android/app/src/main/aidl/com/reactnative/**` → 库 `android/src/main/aidl/com/example/ssr/**`
- 资源与二进制：
  - `apps/telescope-react-native/android/app/src/main/assets/acl/**` → 库 `android/src/main/assets/acl/**`
  - `apps/telescope-react-native/android/app/libs/<abi>/*.so` → 库 `android/src/main/jniLibs/<abi>/*.so`
  - `apps/telescope-react-native/android/app/jni/**` → 库 `android/src/main/jni/**`（badvpn、shadowsocks-libev、pdnsd、libancillary、mbedtls、system.cpp 等）
- Manifest：
  - 声明 `ShadowsocksVpnService` 与 `ShadowsocksRunnerActivity`，并合并 `BIND_VPN_SERVICE` 权限。
- JS 替换点位：
  - `apps/telescope-react-native/src/utils/vpn/vpnStart.android.ts`、`vpnStop.android.ts`、`vpnStatus.android.ts` 从 `NativeModules.TTManager.*` 切换到新模块（或复用兼容层）。

附录 E：常见问题与排查
- 连接卡在 CONNECTING：检查 `VpnService.prepare` 是否完成；确认 tun2socks `--sock-path`、FD 传递是否成功（`TrafficMonitorThread` 是否启动）。
- DNS 解析异常：核对 `pdnsd` 配置与 `--dnsgw`；ACL 的 `[remote_dns]` 是否命中。
- 构建报错找不到 SO：确认库 `jniLibs/<abi>` 是否拷贝齐全，并在 `packagingOptions` 中未被排除。
