---
name: python-tool-ruff
description: 使用 Ruff 执行 Python 代码格式化与静态检查，管理规则、忽略项与性能优化。
---

# Ruff 工具技能

## 适用场景
- 在指定目录运行 Ruff `lint` 与 `format`，清理警告。
- 配置 `pyproject.toml` 中的 Ruff 规则与忽略。
- 替代 Flake8、isort、Black，统一风格与排序。

## 前置准备
- 安装 Ruff（`pip install ruff` 或 `uv tool install ruff`）。
- 配置 `pyproject.toml` 的 `[tool.ruff]`，确保包含 `target-version`。
- 明确目标路径，例如 `src/`, `packages/foo`.

## 操作步骤
1. **命令使用**
   - 检查：`ruff check src --output-format text`.
   - 修复：`ruff check src --fix`.
   - 格式化：`ruff format src`.
2. **配置管理**
   - 在 `pyproject.toml` 中设置：
     ```toml
     [tool.ruff]
     line-length = 110
     target-version = "py311"
     select = ["E", "F", "I", "B", "N", "UP"]
     ignore = []
     ```
   - 使用 `extend-select`、`extend-ignore` 针对模块设置。
3. **忽略策略**
   - 首选局部 `# noqa: F401`，注明原因。
   - 限制 `per-file-ignores` 范围，写明清理计划。
   - 禁止全局关闭关键规则，如 `B`（Bugbear）。
4. **性能优化**
   - Ruff 默认高性能，无需缓存；可使用 `--preview` 体验新规则。
   - 对大型仓库分包执行：`ruff check packages/foo`.
5. **技术债治理**
   - 统计警告数量，分类处理；超过 10 个创建治理任务。
   - 结合 `mypy`、`pytest`，确保修复不影响逻辑。

## 质量校验
- `ruff check` 返回成功，`Found 0 errors`。
- `ruff format --check` 无差异。
- 相关测试、类型检查通过，确保自动修复无回归。

## 失败与回滚
- 自动修复导致单测失败：回退修改，手动修复问题。
- 配置调整引发大量警告：分批治理或恢复旧配置。
- Ruff 升级不兼容：固定版本，提出升级计划。

## 交付物
- Ruff 执行命令记录与输出摘要。
- 配置变更 diff 与说明。
- 技术债清单或清理计划。
