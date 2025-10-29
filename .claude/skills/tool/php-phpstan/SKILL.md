---
name: php-tool-phpstan
description: 当需要高效运行 PHPStan，规划目标选择、配置分层、结果解读与治理流程时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# PHPStan 静态分析技能

## 适用场景

- 在指定包/模块运行 PHPStan 并清零错误，保证新代码严格类型。
- 按项目既定 `phpstan.neon` 配置运行检查，定位并修复报错。
- 规划批量治理、Baseline 清理，支撑 CI 阻断。

## 前置准备

- **禁止 AI 执行 `composer install`**。若依赖缺失需提示维护者处理。
- 理解配置层级：根 `phpstan.neon(.dist)`、包级 `phpstan.neon`、本地 override。
- 确认目标路径（包/模块），保持“目标显式”。
- 在运行命令前使用 `pwd`、`ls` 核对当前目录，仅在目标包/模块内执行分析。
- 所有 `phpstan analyse` 命令必须显式列出目标目录，必要时附带 `--configuration=...` 指向模块配置；禁止执行无参数全量扫描。
- 禁止使用 `--paths-file`（含临时文件路径）；需在命令中直接列出目标目录。
- 遵循仓库既定扩展与规则，不擅自修改 `phpstan.neon`。

## 操作步骤

1. **选择目标**
   - 先运行 `pwd && ls` 确认当前目录为目标包根目录（例如 `packages/order`）。
   - `vendor/bin/phpstan analyse -c packages/order/phpstan.neon src/Domain --error-format=table`.
   - 多目录示例：`vendor/bin/phpstan analyse --configuration=phpstan.neon packages/order/src packages/order/tests`.
   - 使用 `--memory-limit`、`--xdebug` 根据环境调整资源。
2. **结果解读**
   - 关注错误列表：文件、行号、错误说明。
   - 先处理类型错误，再处理约束、不可达代码等。
   - 对第三方或生成代码使用仓库既定 `excludePaths`，禁止临时忽略。
3. **标识符规范检查**（重要）
   - PHPStan 错误标识符必须匹配正则：`/[a-zA-Z0-9](?:[a-zA-Z0-9\.]*[a-zA-Z0-9])?/`
   - **禁止使用下划线**：`phpstan.symfony_web_test.xxx` ❌
   - **使用点分隔的驼峰**：`phpstan.symfonyWebTest.xxx` ✅
   - 在批次二（类型修复）阶段同步检查所有 `->identifier()` 调用
   - 使用搜索验证：`grep -rn "->identifier(" src/ | grep "_"`
4. **本地定位**
   - 在 IDE 或命令行中重现问题，结合类型提示和断言修复。
   - 必要时使用 `dumpType()`（若项目启用）辅助分析。
5. **Baseline 治理**
   - 生成 baseline：`phpstan analyse --generate-baseline`.
   - 清理流程：每次变更删除相关条目并修复代码；禁止在新模块引入 baseline。
   - 在 CI 中检查 baseline 差异，防止回退。
6. **批量治理**
   - 分类错误（缺失返回类型、Mixed、未定义方法等），分批排期。
   - 每批修复后运行关联单元/集成测试确保行为不变。
7. **性能与缓存**
   - `--parallel` 提升速度（需 `ext-pcntl` / Linux）。
   - `--memory-limit=1G` 等参数按需设置；缓存目录 `var/cache/phpstan` 可定期清理。
8. **CI 对齐**
   - 输出格式按平台需求：`--error-format=github`/`json`。
   - 将命令、目标路径记录在提交说明或 Runbook。

## 质量校验

- 目标路径错误数为 0；运行日志无 `ignoreErrors` 警告。
- 如需调整配置，先在本地验证关键目录（config/tests/src）。
- CI 中保留错误统计、执行耗时，监控趋势。

## 失败与回滚

- 配置错误导致命令崩溃：回滚最近配置改动，审查 include/parameters。
- 批量修复触发测试失败：暂停提交，补充测试或回滚代码，确保行为不变。
- 并行模式不兼容：退回串行并记录平台限制。
- 版本升级破坏兼容：锁定稳定版本，阅读升级指南，逐项调整。

## 交付物

- 静态分析报告：命令、目标、错误分类、解决方案。
- 若涉及配置/baseline 变更，记录 diff、Owner、风险评估。
- 验证记录：相关测试命令与通过证明。
- 标识符规范检查结果：确认所有标识符符合命名规范。

## 常见问题与解决方案

### 错误标识符格式问题

**症状**：PHPStan 报错 `Invalid identifier: xxx, error identifiers must match /[a-zA-Z0-9](?:[a-zA-Z0-9\.]*[a-zA-Z0-9])?/`

**原因**：标识符包含下划线或不符合命名规范

**解决方案**：

```php
// ❌ 错误：包含下划线
->identifier('phpstan.symfony_web_test.require_run_in_separate_process')

// ✅ 正确：使用点分隔的驼峰
->identifier('phpstan.symfonyWebTest.requireRunInSeparateProcess')
```

**批量检查命令**：

```bash
# 查找所有包含下划线的标识符
grep -rn "->identifier(" src/ | grep "_"

# 验证修复后无问题
grep -rn "->identifier(" src/ | grep "_" | wc -l  # 应该返回 0
```

### 复杂度问题最佳实践

- **类复杂度 > 50**：考虑提取辅助类（Resolver、Guesser、Validator）
- **方法复杂度 > 10**：使用卫语句、早返回、方法提取
- **AST 遍历**：优先使用 `PhpParser\NodeFinder` 而非手动递归

### 类型修复优先级

1. **先修复标识符规范**：避免最终验证时才发现格式问题
2. **再修复返回类型**：使用 `RuleErrorBuilder::identifier()` 返回 `IdentifierRuleError`
3. **最后修复 PHPDoc**：补充缺失的泛型类型注解
