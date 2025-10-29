---
name: php-tool-monorepo-builder
description: 使用 Monorepo Builder 维护 PHP 多包版本，对齐依赖、合并锁文件并规划发布。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Monorepo Builder 技能

## 适用场景

- 对 monorepo 里的多个包执行依赖对齐、版本号提升、变更日志生成。
- 在发布前合并 composer.lock / package 版本，确保互相兼容。
- 检查配置、规划发布计划、准备回滚脚本。

## 前置准备

- **禁止 AI 自动执行 `composer install`**。如需安装或更新依赖，请提醒维护者手动运行。
- 确认仓库中存在 `monorepo-builder.php`、`composer.json`，并保持工作区干净。
- 明确本次操作影响的包、目标版本、发布窗口。

## 常用命令

| 操作 | 命令 | 说明 |
| ---- | ---- | ---- |
| 校验配置 | `vendor/bin/monorepo-builder validate` | 检查配置文件、路径、版本冲突 |
| 查看包列表 | `vendor/bin/monorepo-builder packages:dump` | 输出包与路径映射 |
| 合并锁文件 | `vendor/bin/monorepo-builder merge` | 将各包的 `composer.json` 合并至根依赖 |
| 版本提升（交互） | `vendor/bin/monorepo-builder release --dry-run` | 选择版本、预览改动 |
| 设定具体版本 | `vendor/bin/monorepo-builder release --version 1.2.0 --dry-run` | 生成变更日志、版本号 |
| 正式发布 | `vendor/bin/monorepo-builder release --version 1.2.0` | 更新版本、生成日志，需确保质量门已通过 |
| 仅生成日志 | `vendor/bin/monorepo-builder release --dry-run --skip-tag` | 预览 changelog |
| 清理生成文件 | `git restore --source=HEAD --staged --worktree composer.json composer.lock` | 失败时回滚（慎用） |

## 操作步骤

1. **预检查**
   - 运行 `validate`、`packages:dump`，记录输出。
   - 确认目标包的版本策略（SemVer），列出待发布变更。
2. **合并与对齐**
   - 执行 `merge` 将各包依赖拉平，随后检查 `composer.json` 差异。
   - 若出现冲突，协调各包版本并手动修复。
3. **版本规划**
   - 使用 `release --dry-run` 决定版本号、Changelog。
   - 在 dry-run 输出中确认将要修改的文件。
4. **质量门**
   - 对受影响包运行 PHPStan、PHPUnit、Lint（参见对应技能）。
   - 禁止跳过质量门；记录命令与结果。
5. **正式发布**
   - 执行 `release --version X.Y.Z`。
   - 审核 `CHANGELOG.md`、版本号与 tag。
   - 等候 CI 全部通过后通知维护者执行 push/tag。
6. **回滚计划**
   - 如发生错误，优先使用 `git restore --source=HEAD --staged --worktree <files>` 恢复相关文件；`git reset --hard` 仅在获授权时执行。
   - 删除错误 tag：`git tag -d vX.Y.Z`、`git push --delete origin vX.Y.Z`（需人工确认）。

## 质量校验

- 命令输出无错误，关键文件（`composer.json`、`CHANGELOG.md`）符合预期差异。
- 所有关联包通过质量门；报告附在提交说明。
- 版本号、变更日志、依赖列表与实际发布内容一致。

## 失败与回滚

- 配置错误：记录报错，恢复 `monorepo-builder.php` 并通知配置拥有者。
- 合并冲突：保留冲突文件给维护者处理，禁止自动覆盖。
- 发布失败或 CI 红灯：停止后续动作，回滚版本改动并更新风险记录。

## 交付物

- 命令执行记录及输出摘要。
- 版本规划表（包名、旧版本、新版本、变更亮点）。
- 质量门与回滚方案，确保发布可追溯。
