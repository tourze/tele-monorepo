---
name: java-tool-junit5
description: 使用 JUnit 5 编写与执行测试，涵盖生命周期、参数化、Mock 与 Testcontainers。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# JUnit 5 测试技能

## 适用场景

- 为 Java 代码编写单元、集成、端到端测试。
- 使用 Mock 框架、参数化、动态测试、断言库。
- 集成 Testcontainers、Spring Test、Jacoco。

## 前置准备

- Gradle/Maven 已引入 `org.junit.jupiter:junit-jupiter`.
- 配置 `testImplementation` 依赖（Mockito, AssertJ, Testcontainers）。
- 确认 `@ExtendWith(SpringExtension.class)` 等扩展可用。

## 操作步骤

1. **测试结构**
   - 测试类命名 `ClassNameTest` 或 `ClassNameIT`。
   - 使用生命周期注解：`@BeforeEach`, `@AfterEach`, `@BeforeAll`, `@AfterAll`.
2. **断言与假设**
   - 使用 `Assertions.assertThat`（AssertJ）或 `Assertions.assertEquals`.
   - `Assumptions.assumeTrue` 控制条件测试。
3. **参数化与动态测试**
   - `@ParameterizedTest` + `@ValueSource`/`@MethodSource`.
   - `@TestFactory` 生成动态测试。
4. **Mock 与替身**
   - Mockito：`@ExtendWith(MockitoExtension.class)`、`@Mock`、`@InjectMocks`.
   - 禁止 Mock 内部模块，优先使用真实实现或 Test Double。
5. **集成测试**
   - Testcontainers：定义静态 `@Container`，自动启动数据库/消息队列。
   - Spring Boot：`@SpringBootTest` + `@AutoConfigureMockMvc`.
6. **覆盖率**
   - Jacoco：`./gradlew jacocoTestReport`。
   - 检查报告 `build/reports/jacoco/test/html/index.html`。

## 质量校验

- `./gradlew test` 或 `mvn test` 全部通过，无 Failed/Skipped。
- 覆盖率达标（≥80%），关键类≥90%。
- Testcontainers/Mock 行为稳定，无随机失败。

## 失败与回滚

- 测试不稳定：使用 `@DirtiesContext` 慎用；定位资源竞争后修复。
- 覆盖率下降：补充测试或恢复逻辑。
- 依赖冲突：锁定 JUnit 版本，确保与 Mockito/AssertJ 兼容。

## 交付物

- 测试报告、覆盖率摘要。
- Testcontainers 配置与资源管理说明。
- 执行命令与日志记录。
