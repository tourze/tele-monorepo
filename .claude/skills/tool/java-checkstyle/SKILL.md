---
name: java-tool-checkstyle
description: 使用 Checkstyle 维持 Java 代码风格与规范，管理规则、抑制策略与报告。
---

# Checkstyle 技能

## 适用场景
- 在 Gradle/Maven 项目中运行 Checkstyle，确保无风格违规。
- 定制规则、Severity、Suppression，保持代码一致性。
- 分析报告，执行批量修复。

## 前置准备
- 项目已配置 Checkstyle 插件和 `checkstyle.xml`。
- 确认规则集（Google/Sun/自定义），了解团队偏好。
- 明确目标模块路径。

## 操作步骤
1. **执行命令**
   - Gradle：`./gradlew checkstyleMain checkstyleTest`.
   - Maven：`mvn checkstyle:check`.
2. **配置管理**
   - `config/checkstyle/checkstyle.xml` 定义规则，示例：
     ```xml
     <module name="Checker">
       <module name="TreeWalker">
         <module name="AvoidStarImport"/>
         <module name="MethodLength">
           <property name="max" value="50"/>
         </module>
       </module>
     </module>
     ```
   - 针对测试或生成代码使用 `suppressions.xml`。
3. **报告分析**
   - 构建后在 `build/reports/checkstyle` 查看 HTML 报告。
   - 分类问题：命名、复杂度、Javadoc、导入。
4. **抑制策略**
   - 使用 `@SuppressWarnings("checkstyle:RuleName")` 仅限特殊情况。
   - `suppressions.xml` 限定范围与注释原因，设定清理计划。
5. **批量修复**
   - 配合 IDE Inspection 或 Spotless 自动修复格式问题。
   - 对复杂规则编写脚本或使用自定义工具辅助修改。

## 质量校验
- Checkstyle 任务成功，报告无错误。
- 抑制条目有明确注释与跟踪，禁止长期忽略。
- 结合 `spotless`, `spotbugs`, `junit` 全部通过。

## 失败与回滚
- 规则过严导致大量错误：先分批治理，必要时回退配置并制订清理计划。
- 升级插件失败：恢复旧版本，提交 Issue 跟进。
- 抑制滥用：审计 `suppressions.xml`，清除无效项。

## 交付物
- Checkstyle 报告摘要与问题分类。
- 规则变更说明、抑制列表及到期时间。
- 修复计划或完成情况。
