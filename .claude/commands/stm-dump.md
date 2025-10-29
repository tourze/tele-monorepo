---
description: 可视化展示当前活动或最近完成的状态机工作流。
allowed-tools: Read(*), Glob(*)
argument-hint: '[command_name]'
---

## 参数

- `command_name` 可省略，默认分析最近的状态机命令。
- 命令名需对应 `.claude/commands/*.md`；若未找到则返回提示。

## 加载技能

- @.claude/skills/method/state-machine-visualizer/SKILL.md ：从命令定义抽取状态机、生成 Mermaid 图、撰写摘要。
- @.claude/skills/method/context-snapshot/SKILL.md （可选）：获取当前状态描述。

## 流程概览

1. **定位工作流**：在对话或任务历史中寻找活动状态机；若无活动，选择最近完成的。
2. **读取定义**：解析目标命令的 Markdown，提取状态与转移。
3. **渲染图形**：调用 `method/state-machine-visualizer` 输出 Mermaid `graph TD`，并高亮当前/终止状态。
4. **输出摘要**：对活动工作流说明当前状态与下一步；对已完成工作流引用最终报告关键信息。

## 产出

- Mermaid 状态机图代码块（含高亮样式）。
- 状态摘要：当前状态意义、可选转移、关键交付物。

## 异常处理

- 未找到状态机：提示“未检索到可复盘的工作流”并结束。
- 命令文件损坏或缺失：提醒修复命令定义后再执行。
- 多个活动工作流：列出候选并请求用户指定。
