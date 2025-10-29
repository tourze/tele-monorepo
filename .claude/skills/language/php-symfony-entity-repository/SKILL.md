---
name: php-symfony-entity-repository
description: 当需要设计与维护 Symfony + Doctrine 的实体与仓储层，确保数据模型、映射与查询兼顾性能与可维护性时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Symfony 实体与仓储技能

## 适用场景

- 新增/修改 Doctrine 实体、关系、枚举、嵌入对象。
- 设计仓储接口、查询方法、批处理，消除 N+1。
- 保障实体契约、迁移、测试与回滚策略。

## 前置准备

- 熟悉目标域的数据模型、约束、现有迁移。
- `vendor/bin/doctrine` 可执行，数据库连接可用。
- 确认代码目录：`src/Domain/*/Entity`, `src/Domain/*/Repository`。

## 操作步骤

1. **数据建模**
   - 使用 PHP Attribute 或注解定义字段类型、长度、默认值。
   - 引入值对象：`@ORM\Embedded`，避免散乱原始类型。
   - 明确关联：`ManyToOne`/`OneToMany` 指定 `fetch`, `cascade`, `orphanRemoval`。
   - 对可选字段使用 `?Type` 配合业务显式校验，避免 `null` 漫游。
2. **仓储接口**
   - 定义接口于 `Domain` 层，基础方法：`find`, `findByIdOrFail`, `save`, `remove`。
   - 实现类放 `Infrastructure\Repository`，注入 `EntityManagerInterface`。
   - 禁止在应用层直接使用 `EntityManager`，统一通过仓储。
3. **查询策略**
   - 使用 `QueryBuilder` 构建查询，参数化所有输入。
   - 预加载关联：`->leftJoin` + `->addSelect` 或 `fetch="EAGER"`（慎用）。
   - 批量更新/删除：优先 DQL 或原生 SQL，执行后清理实体缓存。
   - 分页：结合 `Pagerfanta` 或 `LIMIT/OFFSET`，提供总数与列表。
4. **迁移管理**
   - `doctrine:migrations:diff` 前检查字段顺序、默认值。
   - 手动审查 SQL，优化索引与约束；禁止直接上线未审阅的迁移。
   - 按 expand → switch → contract 两阶段规划。
5. **数据完整性**
   - 在实体层添加 `Assert\*` 验证或构造函数守卫。
   - 对敏感字段记录变更审计（timestamp/operator）。
   - 使用事件监听器处理 `createdAt/updatedAt`、软删除。
6. **测试策略**
   - 编写仓储集成测试，使用事务回滚或测试数据库。
   - Mock `EntityManager` 只用于单元层，推荐使用真实数据库 + Fixtures。
   - 对关键查询提供数据量基准测试，观察 SQL 数量。

## 质量校验

- `doctrine:mapping:info`, `doctrine:schema:validate` 均为 OK。
- `phpstan`, `phpunit` 覆盖实体、仓储逻辑。
- 无新增 Baseline 忽略，N+1 被测试用例捕捉。

## 失败与回滚

- 迁移上线失败：执行 down SQL 或恢复备份。
- 查询性能下降：立即回滚代码，记录慢查询，重新设计索引。
- 实体破坏兼容：维护变更日志，提供数据补救脚本。

## 交付物

- 实体/仓储设计文档（字段表、关系图、查询说明）。
- 迁移脚本、SQL 审核结果、回滚方案。
- 集成测试与性能测试报告。
