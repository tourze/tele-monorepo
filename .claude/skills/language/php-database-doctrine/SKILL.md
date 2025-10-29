---
name: php-database-doctrine
description: 使用 Doctrine ORM 进行数据建模与查询优化。适用于实体映射、仓储模式、事务与性能排查。
---

# Doctrine 数据访问技能

## 适用场景
- 设计或调整实体映射、关系、生命周期回调。
- 排查仓储查询性能（N+1、慢查询）、事务一致性问题。
- 制作数据库迁移、批量数据处理或读写分离策略。

## 前置准备
- 确认数据库连接配置 (`DATABASE_URL`)，并具备目标环境的访问权。
- `vendor/bin/doctrine` 可执行，数据库已生成 schema。
- 熟悉 `migrations/`、`src/Entity/`、`src/Repository/` 目录结构。

## 操作步骤
1. **实体建模**
   - 使用注解/Attribute/YAML 的统一风格；新增字段前检查是否影响枚举或索引。
   - `vendor/bin/doctrine:mapping:info` 查看实体注册情况。
   - 建立关联时优先明确 `fetch="EXTRA_LAZY"` 与 `orphanRemoval` 等属性，避免意外级联。
2. **仓储模式**
   - 仓储只暴露领域需要的方法；禁止在控制器直接访问 EntityManager。
   - 查询模板：
     ```php
     $qb = $this->createQueryBuilder('u')
         ->select('partial u.{id,name}', 'p')
         ->leftJoin('u.profile', 'p')
         ->where('u.status = :active')
         ->setParameter('active', User::STATUS_ACTIVE);
     ```
   - 使用参数化查询，禁止字符串拼接。
3. **性能优化**
   - N+1 诊断：开启 `\Doctrine\DBAL\Logging\DebugStack` 或使用 Symfony profiler。
   - 批量处理：`$em->flush()`+`$em->clear()` 分批执行；必要时使用原生 SQL。
   - 索引与查询计划：`EXPLAIN` SQL，记录慢查询日志。
4. **事务与并发**
   - 统一使用 `transactional()` 或显式 `beginTransaction/commit/rollback`。
   - 需要乐观锁时添加 `@ORM\Version` 字段；并在业务层捕获 `OptimisticLockException`。
5. **迁移管理**
   - `vendor/bin/doctrine:migrations:diff` → 审核生成的 SQL，不得直接上线。
   - 实施双阶段迁移：expand（新增列/表）→ 切换（代码使用新结构）→ contract（删除旧列）。
   - 回滚：`doctrine:migrations:migrate prev` 或自定义 down 脚本。

## 质量校验
- `vendor/bin/doctrine:mapping:info` 无错误。
- `vendor/bin/doctrine:schema:validate` 结果需为 `Mapping` 与 `Database` 均 `OK`。
- 对应模块的回归测试（PHPUnit/Behat）通过；确保新增查询覆盖测试。

## 失败与回滚
- 迁移失败：立即停止执行，使用备份或 down SQL 回滚，并记录影响数据范围。
- 性能调优回退：记录调优前指标，若延迟/错误率上升立即恢复旧查询或索引。
- 数据回滚策略：对 DML 操作准备反向脚本或备份恢复方案。

## 交付物
- 实体/迁移 PRD：说明字段、索引、约束变化。
- 查询优化报告：包含慢查询样本、优化方案、指标对比。
- 回滚与数据修复步骤，确保生产可恢复。
