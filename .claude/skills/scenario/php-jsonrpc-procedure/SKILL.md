---
name: scenario-php-jsonrpc-procedure
description: 当需要设计与生成 JsonRPC Procedure，保持契约一致并配置缓存/锁策略与质量门时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# JsonRPC Procedure 技能

## 适用场景

- 在 Symfony Bundle 中新增或扩展 JsonRPC 接口。
- 需要保持服务分层、缓存策略、并发控制与质量门一致。
- 确保类型严格、质量门通过、测试覆盖。

## 前置准备

- 明确 Procedure 名称、输入输出契约、权限、缓存/锁需求。
- 准备基础类选择（Base/Cacheable/Lockable）。
- 收集依赖服务、DTO、异常定义。

## 操作步骤

1. **契约设计**
   - 定义请求/响应 DTO，参数验证、错误码。
   - 记录权限、速率限制、审计要求。
2. **生成骨架**
   - 使用命令生成 Procedure，实现 `execute()`。
   - 若使用 Cacheable/Lockable，配置缓存键和锁粒度。
3. **实现逻辑**
   - 将业务逻辑委托给 Service，保持贫血模型。
   - 记录日志、traceId、错误处理。
4. **测试与质量门**
   - 编写单测/集成测试：成功/异常/缓存/锁。
   - 运行 PHP-CS-Fixer、PHPStan、PHPUnit。
5. **文档与注册**
   - 更新 API 文档、路由/服务注册、权限矩阵。
   - 如需 versioning，记录兼容策略。

## 质量校验

- Procedure 严格类型，符合 JsonRPC 规范（id、method、params、error）。
- 缓存/锁策略正确，避免死锁或缓存穿透。
- 质量门与测试通过，覆盖率达标。
- 文档更新，包含示例与错误码。

## 失败与回滚

- 质量门失败：修复后重试，必要时回滚生成代码。
- 缓存/锁逻辑问题：禁用缓存/锁并回滚请求，补充测试。
- 契约变更导致兼容性问题：恢复旧版本，制定迁移方案。

## 交付物

- Procedure 源码、注册配置、测试。
- 质量门输出、API 文档更新。
- 权限与监控配置（如有）。
