---
description: 基于实体生成或完善 EasyAdmin CRUD，联动相关技能完成分层与质量门。
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*)
argument-hint: [EntityOrDir] [--menu] [--no-service] [--output <file>] [--strict]
---

## 参数

- 位置参数：`[EntityOrDir]`（单实体或包含实体的目录/Bundle/Project）
- 可选：`--menu`（同步创建菜单项）、`--no-service`（不生成 Service 层）、`--output <file>`、`--strict`
- 生成前需确认实体映射正确、仓储契约齐备。

## 加载技能

- @.claude/skills/scenario/php-easyadmin-crud/SKILL.md ：CRUD 生成步骤、菜单配置、质量门要求。
- @.claude/skills/language/php-symfony-controller-backoffice/SKILL.md ：后台控制器结构与权限。
- @.claude/skills/language/php-symfony-service-layer/SKILL.md ：服务层分工与事务边界。
- @.claude/skills/language/php-symfony-entity-repository/SKILL.md ：实体/仓储建模、查询性能。
- 工具技能：`tool/php-phpstan`、`tool/php-phpunit`、`tool/php-rector`、`tool/php-monorepo-builder`（如需对齐依赖）。

## 流程概览

1. **范围识别**：列出实体、仓储、目标菜单组；确认角色与权限要求。
2. **骨架生成**：依据 `scenario/php-easyadmin-crud` 创建或补全 CrudController、表单配置、字段与筛选器；`--menu` 时同步更新菜单服务。
3. **业务分层**：结合 `language/php-symfony-service-layer` 将业务逻辑放在 Service，控制器仅负责交互。
4. **质量门**：运行 PHP-CS-Fixer、PHPStan、PHPUnit/Paratest；必要时更新翻译与配置，记录命令。
5. **报告与交付**：生成变更清单、菜单/权限说明，必要时写入 `--output` 文件。

## 输出

- 生成/更新的 CrudController、Service、菜单、测试文件列表。
- 质量门命令与结果、权限矩阵、回滚方案。
- 需要手工完成的收尾事项（如翻译文件、手动验证）。

## 异常处理

- 实体缺失或映射错误：暂停生成并参考 `language/php-symfony-entity-repository` 修正。
- 质量门失败：记录原因并自愈，必要时升级讨论。
- 业务逻辑滥用：若发现控制器出现领域逻辑，立即转移到 Service 并补充测试。
