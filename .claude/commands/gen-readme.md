---
description: 生成/更新 README，聚合相关技能产出结构化文档。
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*)
argument-hint: [path] [--output <file>] [--strict]
---

## 参数

- 位置参数：`[path]`（包/项目根目录，缺省为当前目录）
- 可选：`--output <file>`、`--strict`
- 仅读取信息，不修改依赖；禁止在文档中提示自动执行高风险命令（如 `composer install`）。

## 加载技能

- `scenario-readme-author` ：章节规划、质量门记录、回滚策略说明。
- `php-tool-composer` 、`js-tool-vite-bundler` 等：提取依赖、脚本与注意事项。
- `scenario-quality-gates` ：记录验证命令与目标显式执行方式。
- `method-security-baseline` ：提醒配置/密钥管理、安全基线。

## 流程概览

1. **收集上下文**：读取 `composer.json`、`package.json`、`mago.toml` 等，确定名称、用途、脚本、依赖、质量门命令。
2. **结构化输出**：依据 `scenario-readme-author`，生成简介、安装约束、使用示例、配置项、质量门、发布与回滚策略等章节。
3. **交叉校验**：确保示例命令可执行（仅列出而不运行），并按 `tool` 技能核对脚本存在性；禁止建议自动执行写操作命令。
4. **输出**：默认写入标准输出，`--output` 则写入文件；严格模式下检测未知旗标。

## 产出

- Markdown README 内容：符合章节模板、命令可复制、包含质量门与回滚说明。
- 节点检查清单（可在日志中列出），用于人工复核。

## 异常处理

- 信息缺失：列出待补充字段及来源（如缺失 Rate Card 链接），暂停输出或在 README 中标注 TODO。
- 命令无法确认：提示维护者复核后补齐，不得猜测。
- 发现高风险命令：保持描述但加注“需人工执行”，并引用相关技能说明。
