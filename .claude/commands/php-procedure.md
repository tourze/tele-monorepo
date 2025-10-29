---
description: 生成或完善 JsonRPC Procedure，依靠相关技能确保分层与质量门。
allowed-tools: Read(*), Write(*), Edit(*), Bash(*), Glob(*)
argument-hint: [ProcedureName] [--base=<Base|Cacheable|Lockable>] [--output <file>] [--strict]
---

## 参数

- 位置参数：`[ProcedureName]`（PascalCase，动词+名词，放置至 `src/Procedure/...`）
- 可选：`--base=<Base|Cacheable|Lockable>`、`--output <file>`、`--strict`
- 抽象基类决定缓存、锁、超时等策略；需与现有基础设施契约一致。

## 加载技能

- `scenario-php-jsonrpc-procedure` ：Procedure 设计、参数校验、缓存/锁策略。
- `php-symfony-service-layer` ：服务层依赖、事务与幂等。
- `php-core-runtime` ：严格类型、异常链路、日志规范。
- 工具技能：`php-tool-phpstan`、`php-tool-phpunit`、`php-tool-rector` 用于质量门。

## 流程概览

1. **命名校验**：根据 `scenario-php-jsonrpc-procedure` 规则检查 Procedure 名称、命名空间、目录。
2. **骨架生成**：创建类文件、注入依赖、编写 `handle`/`__invoke` 方法，添加参数 DTO 与返回值结构；按 `--base` 引入缓存或锁。
3. **集成配置**：更新服务配置、路由或 `services.yaml`，保持与 `symfony` 架构一致；避免硬编码密钥。
4. **质量门**：运行 PHP-CS-Fixer、PHPStan、PHPUnit（必要时使用 Paratest），并记录命令。
5. **文档与测试**：生成使用示例、异常说明、回滚策略；补充集成测试或契约测试。

## 产出

- Procedure 源码、参数/返回 DTO、配置更新、必要测试。
- 验证记录：质量门命令与 PASS 结果。
- 使用说明或 README 更新（如 `--output` 指定写入报告）。

## 异常处理

- 名称冲突/目录不存在：提示正确路径或建议新建 Bundle。
- 质量门失败：自愈后重跑，必要时升级；禁止跳过静态分析。
- 缓存/锁策略不适配：回退至 `Base`，并记录后续优化建议。
