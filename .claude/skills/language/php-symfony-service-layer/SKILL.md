---
name: php-symfony-service-layer
description: 当需要构建 Symfony 服务层与应用用例，厘清事务边界、依赖注入与可测试性时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Symfony 服务层技能

## 适用场景

- 新建或维护领域服务、应用服务、命令处理器。
- 管理事务、幂等、领域事件、跨模块协作。
- 编写可测试的服务逻辑，避免与基础设施耦合。

## 前置准备

- 明确领域模型、仓储接口、依赖服务。
- 在 `src/Application`、`src/Domain`、`src/Infrastructure` 划分职责。
- 配置依赖注入：`config/services.yaml` 或 PHP 配置。

## 操作步骤

1. **职责划分**
   - **应用服务**：协调用例流程，调用领域服务/仓储。
   - **领域服务**：封装领域规则，处理跨实体逻辑。
   - **命令/查询对象**：使用 `CommandBus`/`QueryBus`（Messenger）保持结构清晰。
2. **依赖注入**
   - 构造函数注入，避免 Setter。
   - 接受接口/抽象而非具体实现。
   - 服务定义显式指定 `public: false`（除入口）。
3. **事务管理**
   - 使用 `TransactionMiddleware` 或显式 `EntityManager` 事务包裹。
   - 读写分离：查询服务仅依赖只读仓储。
   - 幂等：使用锁或幂等表存储处理状态。
4. **领域事件**
   - 利用 `DomainEvent` + `EventDispatcher` 或 Messenger 发布事件。
   - 事件处理器异步执行时，注意失败重试、死信队列。
5. **验证与错误处理**
   - 入参 DTO 使用 Symfony Validator。
   - 对外抛出业务异常，Controller 层统一转换成 HTTP 响应。
   - 记录关键日志（traceId、业务参数）。
6. **测试策略**
   - 单元测试：Mock 仓储与基础设施依赖。
   - 集成测试：使用真实仓储与数据库，验证事务与领域事件。
   - 行为测试：结合 `behat` 或 API 测试确保流程完整。

## 质量校验

- `phpstan`, `phpunit`、`behat`（如有）通过。
- 服务无多余状态，遵循贫血模型。
- 事务、事件、幂等逻辑覆盖在测试中。

## 失败与回滚

- 服务间耦合过深：重构拆分职责，必要时回滚变更。
- 事务死锁：添加重试策略或调整锁粒度。
- 事件队列积压：暂停异步处理，回滚发布代码并排查原因。

## 交付物

- 用例流程图、服务依赖图。
- 事务与幂等策略说明、异常列表。
- 测试报告、回滚计划与运行手册。
