---
name: rust-core-crate
description: 当需要构建与维护 Rust crate，兼顾模块组织、所有权、错误处理与性能优化时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Rust 核心 Crate 技能

## 适用场景

- 新建或维护 Rust 库/服务，管理模块、依赖、特性。
- 处理所有权/借用问题、生命周期、unsafe 审查。
- 优化性能、减少编译时间、发布 crate。

## 前置准备

- 安装 Rust 工具链：`rustup toolchain install stable`。
- 熟悉项目结构：`Cargo.toml`, `src/lib.rs`, `src/bin/*`.
- 启用 Clippy、Rustfmt、Cargo Check 等质量门。

## 操作步骤

1. **项目布局**
   - `lib.rs` 中导出公共 API；内部模块放 `mod`.
   - 对二进制 crate 使用 `src/main.rs` 或 `src/bin/*.rs`.
   - 利用 `feature` 控制可选功能，默认最小化依赖。
2. **所有权与借用**
   - 理解 `&T`/`&mut T` 借用规则，避免悬垂引用。
   - 使用 `Arc`, `Rc`, `RefCell` 时明确线程/可变性边界。
   - 引入 `Cow` 在 copy-on-write 场景。
3. **错误处理**
   - 使用 `Result<T, E>`，实现 `Error` trait。
   - 统一错误类型（`thiserror`, `anyhow`），并在边界记录日志。
4. **依赖管理**
   - 定期 `cargo update`，使用 `cargo tree` 检查依赖树。
   - 对 optional 依赖设置 `default-features = false`。
5. **性能与编译**
   - `cargo check` 快速反馈；`cargo build --release` 生成优化二进制。
   - Profiling：`cargo flamegraph`, `perf`, `criterion` 做基准测试。
   - 使用 `#[inline]`, `#[cold]` 根据性能需求标注。
6. **文档与发布**
   - `cargo doc --open` 生成文档；公开 API 提供示例。
   - 发布前运行 `cargo package --list`，避免多余文件。
   - `cargo publish --dry-run` 验证清单。

## 质量校验

- `cargo fmt --check`, `cargo clippy --all-targets -- -D warnings`, `cargo test --all`.
- `cargo doc` 无警告，公开 API 注释齐全。
- 基准测试指标满足要求。

## 失败与回滚

- 编译器错误无法解决：最小化复现，必要时回退变更。
- 性能优化失效：保留优化前数据，回滚并重新评估。
- 发布失败：使用 `cargo yank` 撤回错误版本。

## 交付物

- Crate 模块图、特性说明。
- 质量门执行记录、基准测试报告。
- 发布/回滚步骤与文档链接。
