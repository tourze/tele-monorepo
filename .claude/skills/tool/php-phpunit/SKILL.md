---
name: php-tool-phpunit
description: 使用 PHPUnit 10+ 构建分层测试，采用属性语法、精准命令与 CI 集成。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# PHPUnit 测试技能

## 适用场景

- 为新功能或缺陷补充先红后绿的自动化测试。
- 运行单元 / 集成 / 功能测试套件，保持执行快速、稳定。
- 输出覆盖率报告，支撑 CI 阻断。

## 前置准备

- **禁止 AI 执行 `composer install`。** 若依赖缺失需提示维护者自行处理。
- 确认使用 PHPUnit 10+，优先采用属性语法（`#[Test]`, `#[DataProvider]`, `#[CoversClass]` 等）。
- 在执行任何命令前先使用 `pwd` 或 `ls` 核对当前目录，确认已进入目标包/模块的根目录。
- 所有 PHPUnit 命令必须显式限定目标（文件路径、`--testsuite`、`--filter` 等），禁止直接扫描仓库根目录或执行无参命令。
- 统一使用仓库根目录 `phpunit.xml`（或 `phpunit.xml.dist`），禁止引用包内自定义配置。
- 熟悉仓库 `phpunit.xml(.dist)` 中的 `<testsuite>` 定义、bootstrap、缓存设置。

## 推荐命令

| 场景 | 命令                                                                                |
| ---- |-----------------------------------------------------------------------------------|
| 运行指定测试类 | `./vendor/bin/phpunit --configuration=phpunit.xml tests/Service/UserServiceTest.php` |
| 运行某套件 | `./vendor/bin/phpunit --configuration=phpunit.xml --testsuite=integration`             |
| 仅运行命名空间内测试 | `./vendor/bin/phpunit --configuration=phpunit.xml --filter '^App\\\\Api\\\\User'` |
| 生成覆盖率 | `phpdbg -qrr ./vendor/bin/phpunit --configuration=phpunit.xml --testsuite=api --coverage-html build/coverage --coverage-text` |

> ⚠️ **重要**：对目录、套件或批量测试命令，应确认并发策略、资源隔离和执行时间是否满足质量门槛，必要时拆分任务或分阶段执行。

## 并发执行与资源隔离

- 根据任务规模选择项目现有的并发脚本或 CI 并行能力，避免长时间串行阻塞。
- 并发运行时为数据库、缓存、文件目录等资源追加唯一后缀（例如 `testdb_${JOB_ID}`），并在完成后清理残留。
- 针对共享状态，优先使用事务回滚、临时目录或显式锁机制，确保测试互不干扰。
- 发生冲突时记录命令、日志与环境变量，便于复盘和持续优化。

## 操作步骤

1. **测试结构**
   - 类命名 `*Test.php`，与被测类保持一一对应。
   - 使用属性标注：

     ```php
     #[CoversClass(App\Service\UserService::class)]
     final class UserServiceTest extends TestCase
     {
         #[Test]
         #[DataProvider('provideInvalidEmail')]
         public function itRejectsInvalidEmail(string $email): void
         {
             // ...
         }
     }
     ```

   - `setUp()` / `tearDown()` 仅处理轻量初始化；复杂准备在测试用 Helper/Builder 中完成。
2. **先红后绿**
   - 在修复前运行测试确认失败（保留命令输出）。
   - 修复后再次运行，确保通过且断言准确。
3. **测试划分**
   - Unit：纯内存、快速。
   - Integration：真实数据库/消息队列，可使用事务回滚。
   - Functional：通过 HTTP/CLI 验证关键流程。
   - 套件在 `phpunit.xml` 中显式列出，便于按需执行。
4. **命令校验**
   - 运行前记录命令与目录，确认仅作用于目标范围；必要时先执行 `pwd && ls tests` 自检。
   - 所有命令固定使用仓库根目录配置：`--configuration=phpunit.xml`。
5. **并行控制**
   - 按需求拆分测试文件或利用 CI 阶段并行化。
   - 针对共享资源，提供隔离方案或锁机制。
   - 临时串行执行需在 Runbook 中记录原因与改进计划。
6. **覆盖率与报告**
   - 使用 `phpdbg` 或 `pcov` 生成覆盖率；结果纳入提交说明。
   - CI 中上传 HTML/Text 报告或阈值校验。
   - 可选开启变异测试（`infection`）验证断言质量。
7. **CI 集成**
   - 将测试命令与耗时写入验证清单，方便复核。

## 质量校验

- 新增测试在修复前失败、修复后通过；无 Risky/Incomplete。
- 并发执行稳定，无共享状态污染。
- 覆盖率满足项目阈值。
- 覆盖率报告已生成并存档。
- **合规检查**：执行记录中包含完整命令、并发参数和资源隔离配置（如适用）。

## 失败与回滚

- 不稳定测试：定位共享状态或时间依赖，修复后再启用；禁止长期跳过。
- 并发冲突：记录现象与日志，必要时临时串行运行并制定后续修复计划。
- 覆盖率下降：补充测试或回滚改动，记录后续计划。

## 交付物

- **测试执行记录**：完整的命令、套件列表、执行结果（包含并发参数）。
- **合规证明**：若使用串行执行，需提供豁免记录和原因说明。
- 覆盖率/报告路径，说明阈值变化。
- 失败场景与修复记录，确保可追溯。
- **资源隔离配置**：说明使用的环境变量、命名约定或清理策略。
