---
name: java-framework-spring
description: 使用 Spring Boot 构建服务，涵盖 Bean 管理、配置、事务、测试与调试。
---

# Spring Boot 框架技能

## 适用场景
- 新建或维护 Spring Boot 项目，需要统一结构与配置。
- 调试依赖注入、事务、配置文件、Actuator 指标。
- 编写集成测试、Mock 外部服务、保障质量门。

## 前置准备
- 安装 JDK 17+，使用 Gradle/Maven 构建。
- 项目结构：`src/main/java`, `src/main/resources`, `src/test/java`.
- 明确配置层级：`application.yml`、`application-<profile>.yml`、环境变量。

## 操作步骤
1. **Bean 与依赖注入**
   - 使用 `@Component`, `@Service`, `@Repository`，避免字段注入。
   - 对配置复杂的 Bean 使用 `@ConfigurationProperties`。
   - `./gradlew bootRun` 时启用 `--debug` 查看自动配置报告。
2. **配置管理**
   - Profile 分层：`application.yml` 全局；`application-prod.yml` 覆盖。
   - 使用 `@Value`/`@ConfigurationProperties` 注入配置，避免硬编码。
   - 机密配置通过环境变量或密钥服务注入。
3. **数据访问与事务**
   - 使用 Spring Data JPA/MyBatis，遵守 Repository 模式。
   - `@Transactional` 作用在服务层，区分读/写事务。
   - 监控 SQL：启用 `spring.jpa.show-sql`（仅开发），生产用 APM或 logback。
4. **验证与安全**
   - Controller 使用 `@Validated` + Bean Validation。
   - Spring Security：定义 `SecurityFilterChain`，最小权限。
   - 全局异常：`@ControllerAdvice` 统一返回结构。
5. **测试策略**
   - 单元：`@ExtendWith(SpringExtension.class)` + `@WebMvcTest`/`@DataJpaTest`。
   - 集成：`@SpringBootTest` + Testcontainers。
   - 使用 `MockMvc`、`RestAssured` 编写行为测试。
6. **运维与诊断**
   - 启用 Actuator：`management.endpoints.web.exposure.include=*`（生产按需）。
   - 使用 `/actuator/health`、`/actuator/metrics`、`/actuator/env`。
   - 日志：Logback 结构化输出，TraceId/SpanId。

## 质量校验
- `./gradlew check`、`./gradlew test`、`spotlessCheck`, `checkstyleMain`。
- Actuator 健康检查通过，无敏感端点暴露。
- 集成测试覆盖关键路径，Testcontainers 运行成功。

## 失败与回滚
- Bean 循环依赖：记录依赖链，调整设计或引入接口。
- 配置冲突：使用 `--debug` 分析 Property 覆盖，回滚错误配置。
- 事务失败：启用日志，必要时使用手工回滚或补偿。

## 交付物
- Spring Boot 模块清单、配置说明。
- 测试报告、Actuator 检查结果。
- 回滚/降级计划（配置版本、Feature Flag）。
