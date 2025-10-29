---
name: rust-tool-clippy
description: 使用 Clippy 静态分析 Rust 代码，处理警告、配置 lint、维护例外。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Clippy 静态分析技能

## 适用场景

- 在 Rust 项目中运行 Clippy，确保零警告。
- 配置 lint 等级、允许列表、dev 依赖。
- 清理历史警告、建立持续治理。

## 前置准备

- 安装 Clippy：`rustup component add clippy`.
- 确认 `cargo clippy --version` 可用。
- 明确目标 crate 或 workspace。

## 操作步骤

1. **命令执行**
   - `cargo clippy --all-targets -- -D warnings`.
   - 对特定 crate：`cargo clippy -p crate-name`.
2. **常见警告处理**
   - `clone_on_copy`: 移除冗余 `clone`.
   - `unwrap_used`: 替换为 `?` 或 `expect`.
   - `large_enum_variant`: 拆分枚举或使用 `Box`.
   - `needless_borrow`: 精简借用。
3. **配置 lint**
   - 使用 `#![warn(clippy::pedantic)]` 提高严格度。
   - 对局部例外使用 `#[allow(clippy::lint_name)]`，并附说明。
   - 在 `clippy.toml` 中设置 `msrv = "1.74"`.
4. **技术债治理**
   - 统计警告数量，按类型分批修复。
   - 超过 10 个警告需创建专项任务。
5. **CI 集成**
   - 在质量门脚本中运行 Clippy。
   - 通过 `RUSTFLAGS` 设置特性（如 `--cfg tokio_unstable`）。

## 质量校验

- `cargo clippy -- -D warnings` 通过，无警告。
- 修复后 `cargo test`、`cargo fmt` 通过。
- 例外列表包含理由、到期时间。

## 失败与回滚

- 新 lint 引发大量警告：评估影响，分阶段启用；必要时锁定 Rust 版本。
- 误报：向 Clippy 提 Issue；临时使用 `allow` 并标注清理计划。
- Clippy 崩溃：更新 nightly 或使用 stable 版本。

## 交付物

- Clippy 执行日志、警告列表与解决方案。
- `clippy.toml` 或 `allow` 注释说明。
- 治理计划与执行结果。
