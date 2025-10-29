---
name: rust-tool-cargo-test
description: 使用 Cargo Test 运行 Rust 单元、集成、属性与基准测试，管理特性与并行。
---

# Cargo Test 技能

## 适用场景
- 执行 Rust 项目的测试套件，覆盖单元、集成、doc、基准。
- 管理 feature flag、目标平台、并行度。
- 调试失败测试、隔离外部依赖。

## 前置准备
- 确保 `cargo` 工具链最新（`rustup update`）。
- 项目包含 `tests/`, `src/lib.rs`, `examples/` 等结构。
- 需要的外部服务（数据库、API）准备好或使用 test double。

## 操作步骤
1. **基础命令**
   - `cargo test`：运行所有测试（单元 + 集成 + doc）。
   - `cargo test --lib`、`--bins`、`--tests` 控制范围。
   - `cargo test foo` 仅运行匹配名称的测试。
2. **特性与配置**
   - 使用 `--features`、`--all-features` 启用功能。
   - 禁用默认特性：`--no-default-features`.
   - `RUST_LOG=debug cargo test` 输出日志。
3. **并行与性能**
   - 默认并行；可通过 `-- --test-threads=1` 串行执行。
   - `cargo nextest run` 提升并发（如项目使用 nextest）。
4. **集成测试**
   - 在 `tests/` 目录编写，使用 `tokio::test` 或 `assert_cmd`.
   - 结合 `testcontainers`、`dockertest` 管理外部依赖。
5. **Doc 与 Bench**
   - 文档示例测试：`cargo test --doc`.
   - 基准测试（nightly）：`cargo bench` 或 `criterion`.
6. **调试失败**
   - `cargo test foo -- --nocapture` 查看打印。
   - `RUST_BACKTRACE=1` 出错时获取堆栈。
   - 使用 `lldb`/`gdb`：`rust-gdb --args target/debug/deps/test_bin`.

## 质量校验
- 所有测试通过，无 `ignored`、`failed`。
- 覆盖功能特性组合，记录执行命令。
- 对慢测试设定阈值，必要时拆分。

## 失败与回滚
- 不稳定测试：定位竞态、时间依赖，修复或隔离；禁用前需审批。
- 外部依赖不可用：使用 mock/testcontainers；必要时回滚相关变更。
- 新特性导致测试失败：回滚并增加回归测试。

## 交付物
- 测试命令、特性组合、执行结果。
- 覆盖率或基准数据（如使用 `grcov`、`cargo tarpaulin`）。
- 测试失败分析与整改计划。
