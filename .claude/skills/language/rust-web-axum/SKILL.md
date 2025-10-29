---
name: rust-web-axum
description: 使用 Axum 构建 Rust Web 服务，覆盖路由、提取器、State、错误处理与测试。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Axum Web 技能

## 适用场景

- 开发 REST/gRPC/WebSocket 服务。
- 管理全局状态、数据库连接、认证授权。
- 编写中间件、错误处理器、端到端测试。

## 前置准备

- `Cargo.toml` 引入 `axum`, `tokio`, `tower`, `serde`, `tracing`.
- 使用 `tower-http` 处理 CORS、压缩、请求 ID。
- 准备数据库或外部依赖连接池。

## 操作步骤

1. **路由与提取器**
   - 定义路由：

     ```rust
     let app = Router::new()
         .route("/health", get(health))
         .route("/users", post(create_user));
     ```

   - 使用 `Json<T>`、`Path`, `State`, `Extension` 提取数据。
2. **全局状态**
   - 利用 `AppState` 结构体存储连接池、配置：

     ```rust
     #[derive(Clone)]
     struct AppState {
         db: PgPool,
     }
     ```

   - 通过 `.with_state(state)` 注入。
3. **中间件**
   - `tower::ServiceBuilder` 添加日志、超时、速率限制。
   - 使用 `HandleErrorLayer` 统一错误响应。
4. **错误处理**
   - 实现 `IntoResponse`：

     ```rust
     enum ApiError { NotFound, Validation(String) }
     impl IntoResponse for ApiError { ... }
     ```

   - 记录 traceId、错误级别。
5. **认证授权**
   - 使用 `axum-extra::extract::cookie::PrivateCookieJar` 管理会话。
   - JWT 场景采用 `TypedHeader<Authorization<Bearer>>`。
6. **测试**
   - `axum::Router` 结合 `tower::ServiceExt` 的 `oneshot` 进行单元测试。
   - 集成测试：`reqwest` + `tokio::spawn` 启动测试服务。
   - 使用 `Testcontainers` 或 `docker-compose` 连接真实数据库。

## 质量校验

- `cargo fmt`, `cargo clippy`, `cargo test` 全部通过。
- `cargo audit` 无高危漏洞。
- 端到端测试覆盖关键路径。

## 失败与回滚

- 中间件顺序错误导致失败：调整 `ServiceBuilder` 顺序或回滚。
- 状态克隆成本高：改用 `Arc` 内部共享。
- 版本升级不兼容：参考变更日志，逐项迁移；必要时回退。

## 交付物

- 路由表、State 结构说明。
- 中间件链与错误处理策略。
- 测试脚本、部署配置与监控项。
