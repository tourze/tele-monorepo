---
name: ts-tool-tsc
description: 使用 TypeScript 编译器执行类型检查与增量构建，处理项目引用、缓存与错误治理。
---

# TypeScript 编译器技能

## 适用场景
- 在指定项目运行 `tsc --noEmit`，确保类型检查通过。
- 管理多 `tsconfig`、项目引用（Project References）与增量编译。
- 识别并修复编译错误、性能瓶颈。

## 前置准备
- 安装 `typescript`，确认 `npx tsc --version`。
- 熟悉 `tsconfig.base.json`、包级 `tsconfig.json`，确保引用关系清晰。
- 确认输出目录（`outDir`）被 `.gitignore` 排除。

## 操作步骤
1. **基础执行**
   - 单包：`npx tsc --noEmit -p packages/ui/tsconfig.json`。
   - 项目引用：在根目录运行 `npx tsc -b` 或指定 `-b packages/ui`.
2. **配置调优**
   - 使用 `extends` 让子项目继承公共配置。
   - 打开严格选项（详见 `ts-type-system` 技能），禁止关闭 `strict`。
   - 配置 `paths` 与 `baseUrl`，结合 `pnpm`/`tsconfig-paths` 解决别名。
3. **增量与缓存**
   - 启用 `incremental: true`、`tsBuildInfoFile` 存储编译信息。
   - 清理编译缓存：`rm -rf **/*.tsbuildinfo`.
4. **常见错误处理**
   - `Cannot find module` → 校验 `paths` 与声明文件。
   - `Property 'x' does not exist` → 更新类型定义或增加类型守卫。
   - `Type 'A' is not assignable to type 'B'` → 分析类型关系，适当引入泛型或映射类型。
5. **性能优化**
   - `npx tsc --extendedDiagnostics` 分析耗时。
   - 拆分大项目为多个引用，减少重复编译。
   - 使用 `isolatedModules: true` 保证每个文件独立编译。

## 质量校验
- 目标项目 `tsc` 无错误；所有依赖项目也需通过。
- 配合 ESLint/Prettier/Vitest 运行，确保工具链协同。
- 若输出 `.d.ts`，使用 `npm pack --dry-run` 验证类型发布。

## 失败与回滚
- 新配置引发大量错误：记录分类，逐步修复；必要时回退配置并建立治理计划。
- 缓存污染导致错误：删除 `tsbuildinfo` 与 `node_modules/.cache` 再编译。
- 项目引用循环依赖：拆分公共类型包或调整依赖方向。

## 交付物
- `tsc` 执行日志与耗时数据。
- 配置变更 diff 与严格模式清单。
- 错误治理计划（若未一次性清零）。
