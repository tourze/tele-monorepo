---
name: java-build-gradle
description: 当需要管理 Gradle 构建、依赖、模块化与性能调优，尤其是在多模块项目中保持一致性时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Gradle 构建技能

## 适用场景

- 维护多模块 Gradle 项目，统一构建脚本与插件。
- 优化构建速度、缓存、并行。
- 管理依赖版本、发布流程、CI 集成。

## 前置准备

- 安装 Gradle Wrapper（`./gradlew`），确认 `gradlew -v`。
- 了解项目结构：根项目、`settings.gradle`, `build.gradle(.kts)`。
- 引入版本管理工具：`version catalogs` 或 `buildSrc`.

## 操作步骤

1. **项目配置**
   - 使用 `settings.gradle` 声明模块：`include(":app", ":core")`。
   - 使用 Gradle Kotlin DSL（`build.gradle.kts`）提升类型安全。
   - 在 `gradle/libs.versions.toml` 管理依赖版本。
2. **构建任务**
   - `./gradlew clean build`：完整构建。
   - `./gradlew :app:bootRun` 启动应用。
   - `./gradlew test`、`./gradlew jacocoTestReport`。
3. **插件与脚本**
   - 常用插件：`java`, `java-library`, `org.springframework.boot`, `io.spring.dependency-management`.
   - 对公共配置提取到父脚本或 `convention plugins`。
4. **性能优化**
   - 启用构建缓存：`org.gradle.caching=true`.
   - 并行与按需配置：`org.gradle.parallel=true`, `org.gradle.configureondemand=true`.
   - 使用 `./gradlew build --scan` 获取性能报告。
5. **依赖管理**
   - `./gradlew dependencies --configuration runtimeClasspath` 查看依赖树。
   - 检查冲突：`./gradlew dependencyInsight --dependency log4j`.
   - 版本对齐：平台模块或 BOM。

6. **发布流程**
   - 使用 `maven-publish` 发布到内部仓库。
   - 版本号策略：SemVer + `gradle.properties`.
   - 在 CI 中执行 `./gradlew check`，生成报告。

## 质量校验

- `./gradlew check`/`build` 成功，无 Failed 任务。
- 构建缓存命中率合理，Scan 报告无严重警告。
- 依赖冲突解决，`dependencyInsight` 输出可控。

## 失败与回滚

- 构建失败：查看 `build/reports`，回滚 `build.gradle` 修改。
- 插件升级不兼容：固定版本，等待兼容补丁。
- 缓存污染：`./gradlew clean build --no-build-cache` 验证后重新启用。

## 交付物

- Gradle 配置 diff、版本管理说明。
- 构建/测试命令与报告链接。
- 性能调优或依赖整理记录。
