---
name: php-tool-composer
description: 管理 Composer 依赖与脚本，强调权限协作、命令使用及禁止自动执行高风险操作。
---

# Composer 管理技能

## 适用场景
- 查看依赖、约束、脚本，规划升级或安全修复。
- 为特定包执行 `require`、`remove`、`update` 前的分析与沟通。
- 处理平台要求、锁文件、自动加载、脚本执行策略。

## 红线提示
- **禁止 AI 主动执行 `composer install`、`composer update`、`composer require` 等写操作命令。**
- 如确需安装或更新依赖，必须明确告知维护者命令与影响，交由人工执行。
- 只允许执行只读命令（例如 `composer show`, `composer validate`, `composer outdated`）或在用户确认后生成指引。

## 常用安全命令
| 命令 | 说明 |
| ---- | ---- |
| `composer validate --no-check-lock` | 校验 `composer.json` 语法与配置 |
| `composer show package/name --tree` | 查看依赖层级（只读） |
| `composer outdated --direct` | 查看直接依赖的可更新版本 |
| `composer audit` | 检查已知安全漏洞（只读） |
| `composer check-platform-reqs` | 确认运行环境满足平台要求 |
| `composer dump-autoload --classmap-authoritative` | 生成优化后的自动加载文件（需评估风险） |

## 操作流程（建议）
1. **需求梳理**
   - 明确依赖升级/新增的目的、范围、风险。
   - 检查是否涉及多包联动或发布计划。
2. **只读分析**
   - 使用 `composer show`, `outdated`, `audit` 收集信息。
   - 记录依赖树、冲突、漏洞状况。
3. **变更计划**
   - 若需要执行写操作，与维护者确认具体命令、版本约束、锁文件处理方式。
   - 制定测试与回滚方案，列出需运行的质量门。
4. **人工执行**
   - 提供命令模板供维护者运行。
   - 强调运行顺序、环境要求（PHP 版本、扩展）。
5. **验证与整理**
   - 更新后运行 `composer validate`, `composer dump-autoload`, `phpstan`, `phpunit` 等。
   - 更新 `CHANGELOG` 或依赖说明，记录风险。

## 质量校验
- `composer validate` 通过，锁文件状态与预期一致。
- 自动加载器生成成功，无类找不到的错误。
- 相关质量门（静态分析、测试）全部通过。

## 失败与回滚
- 依赖冲突：记录冲突包与约束，提出替代方案。
- `composer.lock` 冲突：保留冲突文本，交由维护者手动合并。
- 平台要求不满足：提醒调整 PHP/扩展版本或使用 polyfill。
- 安装失败或引入兼容性问题：恢复锁文件备份，撤销改动。

## 交付物
- 分析记录：依赖树、过期列表、安全审计结果。
- 命令建议与执行顺序（交由人工执行）。
- 验证报告（质量门、测试结果）与回滚策略。
