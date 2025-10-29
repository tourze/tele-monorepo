---
name: rust-tool-rustfmt
description: 使用 rustfmt 统一 Rust 代码格式，管理配置与 CI 集成。
---

# Rustfmt 格式化技能

## 适用场景
- 对指定 crate 执行格式化检查或自动修复。
- 调整 `rustfmt.toml` 配置，保持团队风格一致。
- 在 CI 中运行 `cargo fmt --check`。

## 前置准备
- 安装最新 Rust 工具链，确保 `rustfmt` 可用（`rustup component add rustfmt`）。
- 项目根目录有 `rustfmt.toml`（可选）。
- 明确目标：单个 crate 或整个 workspace。

## 操作步骤
1. **命令执行**
   - 格式化：`cargo fmt`.
   - 检查：`cargo fmt --all -- --check`.
   - 指定文件：`rustfmt src/lib.rs`.
2. **配置示例**
   ```toml
   max_width = 100
   use_small_heuristics = "Max"
   edition = "2021"
   newline_style = "Unix"
   ```
   - 对特定 crate 使用 `config_path`.
3. **处理大规模变更**
   - 使用 `git add -p` 分批提交。
   - 初次引入 rustfmt 时，先整体格式化再继续开发。
4. **CI 集成**
   - 在质量门脚本中添加：`cargo fmt --all -- --check`.
   - 对失败的构建提供 `fmt` 日志。
5. **排障**
   - `rustfmt` 崩溃：更新工具链或最小化复现提 Issue。
   - 未格式化文件：检查 `mod` 是否正确声明。

## 质量校验
- `cargo fmt --check` 无差异。
- 结合 `cargo clippy`, `cargo test` 保证格式化后无回归。
- IDE 与 CLI 格式化保持一致。

## 失败与回滚
- 不期望的单行更改：调整 `rustfmt.toml` 或恢复文件。
- 引入 `unstable_features=true` 时需 nightly：回退或在 CI 禁用。
- 格式化导致冲突：先手动合并再运行 rustfmt。

## 交付物
- 格式化命令与结果说明。
- `rustfmt.toml` 配置变更。
- CI 流程更新记录。
