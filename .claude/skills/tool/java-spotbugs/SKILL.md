---
name: java-tool-spotbugs
description: 使用 SpotBugs 识别 Java 安全与性能问题，覆盖配置、分类与修复策略。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# SpotBugs 技能

## 适用场景

- 在构建过程中运行 SpotBugs 检测潜在缺陷。
- 分析高优先级问题：空指针、安全、并发、性能。
- 维护 `excludeFilter`，避免误报而不遗漏真实问题。

## 前置准备

- 已启用 SpotBugs 插件（Gradle `com.github.spotbugs` 或 Maven）。
- 准备 `spotbugs-exclude.xml` 管理例外。
- 明确目标任务：`spotbugsMain`, `spotbugsTest`.

## 操作步骤

1. **执行命令**
   - Gradle：`./gradlew spotbugsMain`.
   - Maven：`mvn com.github.spotbugs:spotbugs-maven-plugin:spotbugs`.
2. **报告阅读**
   - 输出位于 `build/reports/spotbugs/spotbugs.html`。
   - 关注 `Priority: High`, `Confidence: High` 的问题。
3. **常见缺陷分类**
   - `NP_NULL_ON_SOME_PATH`: 空指针 → 添加非空检查或 Optional。
   - `SQL_INJECTION_JDBC`: SQL 注入 → 使用参数化查询。
   - `DM_DEFAULT_ENCODING`: 默认编码 → 指定 UTF-8。
   - `UG_SYNC_SET_UNSYNC_GET`: 并发访问 → 加锁或使用线程安全集合。
4. **配置与例外**
   - 使用 `effort`、`reportLevel` 调整检测强度。
   - `excludeFilter` 仅针对误报，注明理由与删除计划。
5. **修复流程**
   - 每个缺陷建 Issue，按严重度排序处理。
   - 修复后重跑 SpotBugs + 测试，确保问题消除。

## 质量校验

- SpotBugs 任务成功，无高优先级未解决缺陷。
- 例外条目最少化，包含注释与负责人。
- 修复后质量门（Checkstyle/Spotless/JUnit）通过。

## 失败与回滚

- 插件运行失败：检查 JDK/ASM 版本兼容性，必要时降级。
- 误报过多：与团队讨论调整 `reportLevel`，但保留高优先级。
- 修复引发回归：回滚代码并重新分析缺陷。

## 交付物

- SpotBugs 报告摘要（缺陷列表、状态）。
- 例外过滤文件与说明。
- 修复记录与验证命令。
