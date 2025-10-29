---
name: php-framework-symfony
description: 规范化使用 Symfony 框架进行开发与排查。适用于目录勘察、服务容器、路由与调试场景。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Symfony 框架技能

## 适用场景

- 新成员需要快速理解项目目录结构与 Bundle 划分。
- 排查路由、依赖注入、事件监听、配置覆盖等框架级问题。
- 在本地或容器中运行框架命令、调试 profiler、生成代码。

## 前置准备

- 明确当前执行环境（`APP_ENV`、`APP_DEBUG`）并加载 `.env.local`。
- 熟悉 `config/` 目录下的分层：`packages/`、`services.yaml`、`routes/`。

## 操作步骤

1. **目录与 Bundle**
   - 通过以下命令梳理项目结构：

     ```bash
     tree -L 2 src/
     symfony console debug:autowiring | head
     ```

   - 确认是否采用多 Bundle；若有，记录每个 Bundle 的职责与入口。
2. **服务容器与依赖注入**
   - `symfony console debug:container <service>` 查找服务定义与别名。
   - 若服务无法注入，检查 `services.yaml` 的 `autowire`/`autoconfigure`，或在 `config/services/` 下的环境特定配置。
3. **路由与控制器**
   - `symfony console debug:router` 查看路由表；过滤 JSON-RPC/GraphQL 等特定前缀。
   - 使用 `symfony console router:match "/path"` 快速验证控制器解析。
4. **配置层次**
   - 按 `config/packages/*.yaml` → `config/packages/<env>/*.yaml` → `config/services.yaml` → `config/services_<env>.yaml` 顺序排查覆盖。
   - 对于第三方包，查阅其在 `vendor/<pkg>/Resources/config` 的默认配置。
5. **调试与日志**
   - 启用 profiler：`APP_DEBUG=1 symfony serve`；使用 `/ _profiler` 查看请求详情。
   - 分析日志：`tail -f var/log/dev.log`、`var/log/prod.log`，结合 `monolog` 配置。
6. **常见任务**
   - Doctrine Migrations：`symfony console doctrine:migrations:status`。
   - 缓存管理：`symfony console cache:clear` → 注意区分 `prod` 与 `dev`。
   - 生成器：`symfony console make:entity`、`make:controller`，确保遵循贫血模型与服务分层。

## 质量校验

- 运行框架自带的 `symfony console lint:container`、`lint:twig`、`lint:yaml`。
- 在目标模块执行 `vendor/bin/phpunit --testsuite <suite>`，验证依赖未被破坏。
- 对照 `CLAUDE.md` 中的 N+1 红线，通过 `symfony console debug:autowiring` 检查数据访问层是否合规。

## 失败与回滚

- 配置修改导致容器失效时，执行 `symfony console cache:clear` 并回滚改动。
- 若路由冲突，使用 `router:match` 验证变更前后差异，必要时回退 commit。
- Doctrine 迁移失败：先 `doctrine:migrations:status`，使用回滚脚本或 `migrations:execute --down`.

## 交付物

- 调试笔记：命令执行记录、发现的问题、修复方案。
- 若做了配置或代码改动，需附带测试结果与质量门命令。
- 回滚说明：指出依赖的配置文件与撤销步骤。
