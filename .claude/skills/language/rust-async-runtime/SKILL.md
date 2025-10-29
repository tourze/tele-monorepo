---
name: rust-async-runtime
description: 当需要选择或调优 Rust 异步运行时（Tokio/async-std），解决并发、IO 与资源管理难题时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Rust 异步运行时技能

## 适用场景

- 构建基于 Tokio/async-std 的网络服务或任务调度。
- 处理异步任务泄漏、阻塞、背压、超时。
- 管理连接池、通道、任务取消与结构化并发。

## 前置准备

- 熟悉 `Cargo.toml` 中启用的运行时特性（`tokio = { features = ["rt-multi-thread"] }`）。
- 明确服务类型（HTTP、gRPC、消息队列）与并发需求。
- 启用 `RUST_BACKTRACE=1` 便于调试。

## 操作步骤

1. **运行时选择**
   - 默认使用 Tokio，多线程运行：`#[tokio::main(flavor = "multi_thread")]`.
   - CPU 密集型任务使用 `spawn_blocking` 或 rayon。
2. **异步模式**
   - 使用 `async fn`、`await`；禁止在异步上下文调用阻塞 I/O。
   - 借助 `select!`、`join!` 实现并行等待。
3. **资源管理**
   - 连接池：使用 `bb8`/`deadpool`，配置最大连接数与超时。
   - 通道：`mpsc`, `broadcast`; 设置容量防止无界堆积。
   - 超时：`tokio::time::timeout`；重试使用 `retry` 库。
4. **错误与取消**
   - 使用 `tokio::task::JoinHandle`，调用 `abort` 取消任务。
   - 捕获 `JoinError`，记录 Panic 与取消原因。
5. **诊断与调试**
   - 启用 `tokio-console`：`RUSTFLAGS="--cfg tokio_unstable"`.
   - 使用 `tracing` + `tracing-subscriber` 输出异步跨度。
   - 监控度量：`metrics` crate、Prometheus exporter。
6. **测试**
   - `#[tokio::test]` 编写异步测试；设置 `flavor` 与 `worker_threads`。
   - 使用 `loom` 做并发模型检查。

## 质量校验

- `cargo test` 全部通过，异步测试无随机失败。
- 运行时指标稳定（任务队列长度、延迟）。
- 无阻塞警告（Tokio 控制台/日志）。

## 失败与回滚

- 阻塞导致卡死：识别阻塞代码，迁移到 `spawn_blocking`；必要时回滚。
- 资源泄漏：跟踪 `JoinHandle`，确保任务完成或取消。
- 运行时升级不兼容：锁定版本，查看 Release Notes。

## 交付物

- 运行时配置与线程模型说明。
- 监控仪表盘、Tracing 样例。
- 测试报告与潜在风险记录。
