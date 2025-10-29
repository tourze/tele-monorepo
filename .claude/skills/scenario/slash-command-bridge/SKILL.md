---
name: scenario-slash-command-bridge
description: 为非 Claude Code 环境（如 Gemini CLI / Codex）提供 slash command 的发现、解析与执行能力。
---

# 斜杠命令桥接技能 (Slash Command Bridge)

## 适用场景
- 当用户在非原生支持的环境（如 Gemini CLI、Cursor）中输入以 `/` 开头的命令时。
- 需要模拟 Claude Code 的斜杠命令机制，加载并执行对应的 `.claude/commands/` 或 `~/.claude/commands/` 中的文件。

## 前置准备
- 具备文件系统的读写和执行权限 (`read_file`, `glob`, `run_shell_command`)。
- 明确项目级命令目录 `.claude/commands/` 和用户级命令目录 `~/.claude/commands/` 的存在。

## 操作步骤

当接收到以 `/` 开头的用户输入时，按以下顺序执行：

1.  **识别与定位 (Identify & Locate)**
    *   从用户输入中解析出命令名称和参数。例如，从 `/fix-issue 123 --priority high` 中解析出命令为 `fix-issue`，参数为 `123 --priority high`。
    *   使用 `glob` 工具，按以下顺序查找对应的 `.md` 文件：
        1.  项目命令：`.claude/commands/**/<command-name>.md`
        2.  用户命令：`~/.claude/commands/**/<command-name>.md`
    *   若找到多个匹配项（例如项目和用户目录中都存在），优先使用**项目命令**。
    *   若未找到任何匹配文件，则向用户报告“未知命令”。

2.  **加载与解析 (Load & Parse)**
    *   使用 `read_file` 读取找到的 `.md` 文件内容。
    *   解析文件的 `frontmatter`（如果存在），提取 `description`、`argument-hint`、`allowed-tools` 等元数据。
    *   将文件主体作为基础提示模板。

3.  **执行前置命令 (Pre-execution)**
    *   扫描提示模板中所有以 `!` 开头的行。
    *   对于每一行，提取 `!` 后的 Shell 命令。
    *   **逐一、串行地**使用 `run_shell_command` 执行这些命令。
    *   将每个命令的 `stdout` 保存下来，用于后续替换。若任何命令执行失败，则终止整个流程并向用户报告错误。

4.  **构建最终提示 (Prompt Construction)**
    *   创建一个新的、最终的提示内容。
    *   将基础提示模板中的参数占位符（`$ARGUMENTS`, `$1`, `$2`...）替换为用户输入的实际参数。
    *   将模板中的 `!<bash_command>` 行替换为对应命令在上一步中捕获的 `stdout` 内容。
    *   将 `frontmatter` 中的元数据信息（如 `description`）作为上下文补充。

5.  **执行主任务 (Execute Main Task)**
    *   将构建好的最终提示作为当前任务的**最高优先级指令**。
    *   **停止 `slash-command-bridge` 技能的后续步骤**，并立即开始响应和执行这个新构建的提示内容。就如同用户直接输入了这段完整的提示一样。

## 质量校验
- 确保定位到的命令文件路径正确，且优先使用项目级命令。
- 在执行任何 `!` 命令前，必须对其进行安全评估。
- 参数替换必须精确，特别是处理带空格的参数时。
- 最终构建的提示内容必须完整地包含了所有预处理步骤的输出。

## 失败与回滚
- **命令未找到**: 明确告知用户命令不存在，并可以建议使用 `/help`（如果已实现）或列出可用命令。
- **前置命令失败**: 立即停止，并将 `run_shell_command` 的错误信息呈现给用户，不继续执行主任务。
- **参数不匹配**: 如果 `argument-hint` 存在，可以根据它来提示用户正确的用法。
