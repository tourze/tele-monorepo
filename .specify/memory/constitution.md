# Telescope Monorepo Constitution

<!--
Sync Impact Report:
- Version: 1.2.0 → 2.0.0 (MAJOR: 完全重构以匹配跨端网络工具 monorepo)
- Principle changes:
  - [REMOVED] App Router 优先 → N/A（不适用，非 Next.js 项目）
  - [REMOVED] 性能优先（Next.js 特定）→ 由新的"性能与资源效率"替代
  - [RENAMED] 类型安全强制 → 类型安全与编译时检查
  - [RENAMED] 组件化与复用 → 模块化与跨端复用
  - [KEPT] 简洁性与可维护性
  - [KEPT] 中文优先
  - [NEW] 原生优先
  - [NEW] Monorepo 边界清晰
- Added sections:
  - Core Principles > 原生优先
  - Core Principles > Monorepo 边界清晰
  - Development Standards > Monorepo 结构
  - Development Standards > 原生模块开发
  - Development Standards > 跨端策略
- Modified sections:
  - Development Standards > 文件组织（适配 monorepo）
  - Quality Gates（适配 React Native + Tauri + Rust）
- Removed sections:
  - Development Standards > 种子数据管理（Prisma 相关，不适用）
  - Development Standards > 数据获取模式（Next.js 特定）
  - Development Standards > 环境变量（Next.js 特定前缀规则）
- Templates status:
  ✅ plan-template.md: 通用模板，无需修改
  ✅ spec-template.md: 通用模板，无需修改
  ✅ tasks-template.md: 通用模板，无需修改
- Follow-up: None
-->

## Core Principles

### I. 原生优先

网络能力（TCP/UDP、Ping、VPN）MUST 通过原生模块实现，禁止依赖纯 JavaScript polyfill 处理底层网络操作；React Native 使用 TurboModules/Fabric 架构（New Architecture），确保 JavaScript 与原生层的高效通信；Tauri 使用 Rust 编写核心逻辑，前端仅作为 UI 层。

**理由**：网络工具对延迟和性能敏感，JavaScript 无法直接操作套接字，原生实现是唯一可行方案；Rust 在 Tauri 中提供内存安全和高性能。

### II. 类型安全与编译时检查

TypeScript 必须启用严格模式（strict: true）；禁止使用 `any` 类型（除非明确标注并说明原因）；Rust 代码必须通过 `cargo clippy` 无警告；原生模块的 JS 接口必须有完整类型定义（`.d.ts`）；使用 Codegen 自动生成原生桥接代码的类型。

**理由**：跨语言边界（JS ↔ Native ↔ Rust）容易出错，编译时类型检查是防止运行时崩溃的关键防线。

### III. 模块化与跨端复用

每个原生模块（`packages/*`）MUST 独立可发布、可测试；业务逻辑与 UI 分离，UI 组件通过 `react-native-web` 或平台适配层实现跨端；共享代码放在独立包中，避免跨包直接引用源码。

**理由**：Monorepo 的价值在于复用，模块边界清晰才能独立演进和测试。

### IV. Monorepo 边界清晰

包之间通过 `peerDependencies` 声明依赖，避免隐式耦合；每个包有独立的 `package.json`、构建配置和测试；workspace 配置的 `nohoist` 列表维护 React Native 生态兼容性；禁止循环依赖。

**理由**：React Native 生态对依赖提升敏感，边界清晰避免"在我机器上能跑"问题。

### V. 性能与资源效率

网络操作 MUST 异步执行，禁止阻塞主线程；内存敏感操作（如大文件传输）使用流式处理；避免不必要的 Bridge 调用（批量操作、本地缓存）；Tauri 前端 bundle 体积控制在合理范围内。

**理由**：移动设备资源有限，网络工具需长时间运行，效率直接影响用户体验和电池消耗。

### VI. 简洁性与可维护性（非妥协）

遵循 SOLID、KISS、DRY、YAGNI 原则；新增依赖需明确理由（避免过度工程化）；代码审查必须检查"是否有更简单方案"；禁止过度抽象（提前优化是万恶之源）。

**理由**：简洁代码降低认知负担，提高交付速度，减少 bug 表面积；对应 CLAUDE.md 的准则。

### VII. 中文优先

所有文档、注释、提交信息、代码审查必须使用中文；变量名、函数名、类型定义使用英文（符合编程惯例）；技术术语保留英文原文或使用通用中文译名；异常消息和日志使用中文以便快速定位问题。

**理由**：统一项目语言降低沟通成本，提高团队协作效率。

## Development Standards

### Monorepo 结构

```text
tele-monorepo/
├── packages/                    # 独立可发布的包
│   ├── react-native-shadowsocksr/  # SSR/VPN 原生模块
│   ├── react-native-udp/           # UDP 套接字模块
│   ├── react-native-tcp-ping/      # TCP Ping 模块
│   ├── react-native-curl/          # CURL 网络请求模块
│   ├── tauri-plugin-tcp-ping/      # Tauri TCP Ping 插件
│   └── telescope-react-native/     # 主应用
├── scripts/                     # Monorepo 管理脚本
└── .specify/                    # 规范与模板
```

### 原生模块开发

- 目录结构：`src/`（JS 入口）、`android/`、`ios/`、`cpp/`（可选共享 C++）
- Codegen 配置：每个模块必须配置 `codegenConfig` 以生成类型安全的桥接代码
- 版本兼容：`peerDependencies` 明确 React Native 版本范围（如 `>=0.74 <0.82`）
- 原生代码风格：Android 使用 Kotlin，iOS 使用 Swift（新代码），Rust 使用 rustfmt

### 跨端策略

| 平台 | 技术栈 | 备注 |
|------|--------|------|
| Android | React Native 0.74 + 原生模块 | Gradle flavor 支持多渠道 |
| iOS | React Native 0.74 + 原生模块 | CocoaPods 管理依赖 |
| macOS/Windows/Linux | Tauri 2.x + Rust | Webpack 构建前端 |
| Web | React Native Web | 有限功能（无原生网络能力） |

### 命名规范

- 包名：`react-native-*`（RN 模块）、`tauri-plugin-*`（Tauri 插件）
- 组件文件：PascalCase（`UserProfile.tsx`）
- 工具函数文件：kebab-case（`format-date.ts`）
- Rust 模块：snake_case（`tcp_ping.rs`）
- Android 包名：`com.xxx`（与 codegenConfig 一致）

### 构建命令

```bash
# React Native
yarn run-android-gw    # 运行指定渠道的 Android 调试版
yarn build-android-gw  # 构建指定渠道的 Android 发布版

# Tauri
yarn tauri:dev         # 开发模式
yarn tauri:build       # 生产构建
yarn build-macos-universal  # 构建 macOS 通用二进制
```

## Quality Gates

### 代码提交前

- ✅ TypeScript 编译通过（无类型错误）
- ✅ `cargo clippy` 无警告（Rust 代码）
- ✅ ESLint 检查通过
- ✅ 原生模块在目标平台编译成功

### Pull Request 检查

- 代码审查必须验证：类型安全、跨端兼容性、简洁性
- 新增原生依赖需在 PR 描述中说明理由和平台影响
- 涉及原生模块的变更需在 Android + iOS 实机测试
- Bundle size 变化需说明（threshold: +100KB 需解释）

### 发布前

- 所有目标平台构建成功
- 主要用户路径手动测试通过
- Tauri 桌面端功能验证
- 更新 CHANGELOG 和版本号

## Governance

宪法优先级高于所有其他实践文档；违反原则需在 PR 或设计文档中明确说明原因和权衡；宪法修订需团队共识（超过 50% 成员同意）并更新版本号；定期审查（每季度）检查原则是否适应项目演进。

**复杂性豁免流程**：若需违反简洁性原则（如引入新架构层），必须在 `plan.md` 的 Complexity Tracking 表中记录：违反项、为何必要、为何更简单方案不可行。

**开发指导**：运行时开发决策参考本宪法；具体实现细节查阅 React Native 和 Tauri 官方文档。

**Version**: 2.0.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-29
