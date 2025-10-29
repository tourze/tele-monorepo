---
name: ts-type-system
description: 深入掌握 TypeScript 类型系统，应用于严格模式、泛型、类型推断与 API 契约。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# TypeScript 类型系统技能

## 适用场景

- 设计稳定的类型定义、接口与枚举，避免 `any`/`unknown` 滥用。
- 为复杂数据结构编写泛型与类型守卫。
- 升级 TypeScript 严格配置，处理编译器错误。

## 前置准备

- 确认 `tsconfig.json` 使用 `strict: true` 或更严格配置。
- 了解项目的类型声明来源（`@types`、自定义 `global.d.ts`）。
- 已安装 `typescript` CLI：`npx tsc --version`.

## 操作步骤

1. **配置审查**
   - 在 `tsconfig.json` 启用以下选项：`noImplicitAny`、`strictNullChecks`、`noUncheckedIndexedAccess`、`exactOptionalPropertyTypes`。
   - 针对前端项目，设置 `jsx: react-jsx`，确保模块解析一致。
2. **类型建模**
   - 使用 `type`/`interface` 明确对象结构，避免过度联合。
   - 利用 `as const` 锁定字面量，提供 `Enum` 替代方案。
   - 针对 API 响应定义 `zod`/`valibot` schema，并生成类型。
3. **泛型与工具类型**
   - 掌握 `Partial`、`Pick`、`Record` 等工具类型，必要时创建自定义类型。
   - 编写类型守卫：

     ```ts
     export function isUser(value: unknown): value is User {
       return typeof value === 'object' && value !== null && 'id' in value;
     }
     ```

4. **错误修复策略**
   - 抛弃 `any`：通过类型收窄、泛型约束或 `unknown` + 守卫。
   - 处理 `never`：检查联合类型覆盖，使用 `assertNever` 保证完整性。
   - 提升类型安全：引入 `readonly`, `brand` 类型避免误用。
5. **类型测试**
   - 使用 `expectTypeOf`（Vitest）或 `tsd` 编写类型测试，保护公共 API。
   - 对公共包导出的类型编写文档并生成 `.d.ts`。

## 质量校验

- 执行 `npx tsc --noEmit`，确保无错误。
- 配合 ESLint `@typescript-eslint/*` 规则，检查类型使用是否符合规范。
- 对关键类型运行 `tsd` 或 `vitest --typecheck`。

## 失败与回滚

- 严格模式开启后错误过多：记录错误分类，制定分批治理；禁止降级严格度。
- 泛型重构导致编译时间增加：评估复杂度，必要时回滚并拆分类型。
- 类型守卫不完整引发运行时错误：补充单测与类型测试后再重新启用。

## 交付物

- 更新后的 `tsconfig` 差异说明。
- 类型定义与守卫示例、测试结果。
- 分批治理计划或例外卡（如需临时豁免）。
