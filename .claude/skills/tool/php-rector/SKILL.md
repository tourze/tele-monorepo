---
name: php-tool-rector
description: 在 PHP 项目中安全使用 Rector 进行代码自动修复与升级，包含规则选择、Dry-run、验证流程。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Rector 自动化重构技能

## 适用场景

- 进行 PHP 版本升级、语法现代化或批量重构。
- 清理遗留模式（如数组语法、非空判断），统一代码风格。
- 为大型变更准备可回滚的自动化脚本。

## 前置准备

- 确认 `rector.php` 配置文件存在且与项目约定一致。
- 备份目标分支或确保 git 工作树干净。
- 已安装 Rector：`vendor/bin/rector --version`.

## 操作步骤

1. **规则审查**
   - 打开 `rector.php`，分组启用规则集；必要时创建自定义规则。
   - 禁止直接启用全量 set；仅选择需要的 `SetList::PHP_80`、`SetList::CODE_QUALITY` 等。
2. **Dry-run 验证**
   - 首次运行使用 `--dry-run --diff`：

     ```bash
     vendor/bin/rector process packages/foo --dry-run --diff
     ```

   - 审核每个 diff，确认未触碰公共 API 或违反贫血模型。
3. **正式执行**
   - `vendor/bin/rector process packages/foo`.
   - 立即运行 `php-cs-fixer`/`phpstan`/`phpunit`，确保自动修改未破坏质量门。
4. **自定义规则**
   - 新建 `Rector` 类时，确保包含单元测试（`tests/Rector/...`）。
   - 使用 `RuleDefinition` 描述输入输出示例，加强回归保护。
5. **分批提交**
   - 大规模变更按目录/规则拆分，多次提交，保证单次 diff 可审。
   - 每批提交附带执行命令与验证内容。

## 质量校验

- Rector 执行后必须通过 `phpstan`、`phpunit`、`php-cs-fixer`。
- 对自定义规则运行其测试套件（`vendor/bin/phpunit tests/Rector`）。
- 若修改公共接口，需额外评估下游影响并补充文档。

## 失败与回滚

- 自动修复导致测试失败：定位具体规则，使用 `--skip` 暂时跳过或回退变更。
- 不可预期的代码风格变化：调整 `rector.php` 配置或增加 `configuredRule`.
- 需要回滚文件时使用 `git restore --source=HEAD --staged --worktree <files>`，随后重新分组执行。

## 交付物

- 规则与执行记录：列出启用的规则集、命令行、dry-run diff 审核结论。
- 验证结果：质量门命令及通过情况。
- 回滚策略：若需停用规则或撤销变更，提供步骤与注意事项。
