---
name: java-tool-spotless
description: 使用 Spotless 格式化 Java/Kotlin 代码，配置 Google/Palantir 风格并集成 CI。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Spotless 格式化技能

## 适用场景

- 保持 Java/Kotlin 源码格式一致，符合团队规范。
- 在 Gradle/Maven 中自动执行格式化检查与修复。
- 处理大规模格式化变更，减少冲突。

## 前置准备

- 项目使用 Gradle 或 Maven，并已应用 Spotless 插件。
- 了解目标风格：`googleJavaFormat`、`palantirJavaFormat`、`ktlint`。
- 明确执行范围（模块或整个项目）。

## 操作步骤

1. **配置示例**

   ```kotlin
   plugins {
       id("com.diffplug.spotless") version "6.25.0"
   }

   spotless {
       java {
           googleJavaFormat()
           target("src/**/*.java")
       }
       format("misc") {
           target("*.md", ".gitignore")
           trimTrailingWhitespace()
           endWithNewline()
       }
   }
   ```

2. **命令执行**
   - 检查：`./gradlew spotlessCheck`.
   - 修复：`./gradlew spotlessApply`.
3. **范围控制**
   - 对多模块项目在子模块单独配置 `spotless`.
   - 使用 `targetExclude` 排除生成或第三方代码。
4. **CI 集成**
   - 在质量门中执行 `spotlessCheck`，失败即阻断提交。
   - 提前在本地 `spotlessApply`，避免 CI 格式不通过。
5. **大规模格式化**
   - 首次引入时分模块执行，减少巨大 diff。
   - 使用 `git add -p` 或 `git commit --no-verify` 细分提交。

## 质量校验

- `spotlessCheck` 通过，无需要格式化的文件。
- 与 IDE 格式化规则一致，避免本地/CI 不同。
- 格式化后运行 `./gradlew check` 确保无编译问题。

## 失败与回滚

- `spotlessApply` 修改过多：使用 `git restore --source=HEAD --staged --worktree <files>` 撤销后分批处理。
- 版本升级格式变更：在团队内评审后再推广；必要时回退插件版本。
- Maven 项目：确保 `mvn spotless:apply` 配置一致。

## 交付物

- Spotless 配置片段、命令执行记录。
- 引入或升级说明、团队同步结论。
- 格式化策略（触发时机、提交规范）。
