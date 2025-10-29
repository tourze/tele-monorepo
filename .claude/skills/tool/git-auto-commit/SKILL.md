---
name: git-tool-auto-commit
description: 当需要在自动化修复流程中安全执行 git 暂存与提交，保持提交信息合规并保留回滚路径时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Git 自动提交技能

## 适用场景

- `/fix-code`、批量格式化或自动修复脚本需在完成质量门后自动生成提交。
- 需要确保工作区在执行前干净，提交信息符合约定格式，并提供失败时的回滚策略。
- 需要为自动化流程配置开关（禁用自动提交、允许脏工作区）并记录验证命令。

## 前置准备

- 仓库根目录必须存在 `.git`；若无则禁止执行自动提交。
- 执行前默认要求 `git status --porcelain` 为空；如需在脏工作区运行，务必设置 `FIX_CODE_ALLOW_DIRTY=1` 并记录原因。
- 确认自动提交开关：未显式设置时默认开启；设置 `FIX_CODE_AUTO_COMMIT=0` 或 `false` 可禁用。
- 准备好提交信息模板，例如 `chore(fix-code): auto fix <path>`。

## 操作步骤

1. **工作区检查**

   ```bash
   git status --porcelain
   ```

   - 输出为空方可继续；否则根据需求清理或设置 `FIX_CODE_ALLOW_DIRTY=1` 后再执行。
2. **暂存变更**

   ```bash
   git add --all
   git status --short
   ```

   - 确认真正需要提交的文件均被暂存，避免包含无关改动。
3. **生成提交**

   ```bash
   git commit -m "chore(fix-code): auto fix <path>"
   ```

   - 提交信息需说明来源（fix-code）与作用范围；如提交失败记录 stderr 并停止流程。
4. **提交验证**

   ```bash
   git status --short
   git log -1 --stat
   ```

   - 确保工作区重新变为干净，并保存提交内容概览以备审计。

## 质量校验

- 自动提交仅在质量门全部通过后触发。
- 提交信息前缀一致，易于回滚与检索（推荐 `chore(fix-code): ...`）。
- 若自动提交被禁用或失败，流程需提醒人工补交并给出命令。

## 失败与回滚

- `git add` 或 `git commit` 失败：立即终止自动化流程，输出错误信息与补救建议。
- 生成的提交有误：执行 `git reset HEAD~1` 回滚，并重新运行流程。
- 发现误提交到错误分支：使用 `git revert` 或 `git cherry-pick` 到正确分支，同时记录事故与防范措施。

## 交付物

- 自动提交的 commit（含消息与验证命令）。
- 若禁用自动提交或允许脏工作区，需在 Runbook 中记录原因与后续动作。
