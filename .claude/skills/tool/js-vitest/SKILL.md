---
name: js-tool-vitest
description: 使用 Vitest 编写与运行 JS/TS 测试，覆盖配置、Mock、类型测试与性能优化。
---

# Vitest 测试技能

## 适用场景
- 为组件/函数编写单元与集成测试。
- 管理 Vitest 配置、测试环境（jsdom/node）、Mock 策略。
- 执行覆盖率统计、类型测试、并行加速。

## 前置准备
- 项目已安装 `vitest`、`@vitest/ui`、`@testing-library/*` 等依赖。
- 了解 `vitest.config.ts`，确认测试目录与别名配置。
- TypeScript 项目启用 `vitest --typecheck` 或结合 `tsc -b`.

## 操作步骤
1. **编写测试**
   - 使用 Testing Library 行为驱动写法：
     ```ts
     it('should show error message when API fails', async () => {
       server.use(rest.get('/api/user', (_, res, ctx) => res(ctx.status(500))));
       render(<Profile />);
       await screen.findByText(/加载失败/);
     });
     ```
   - 避免快照，优先断言文本、角色、交互结果。
2. **Mock 策略**
   - 使用 `vi.mock` 替换外部依赖，禁止 Mock 内部模块。
   - 结合 MSW 模拟网络请求；使用 `afterEach(vi.clearAllMocks)` 清理。
3. **配置调优**
   - 在 `vitest.config.ts` 中设置 `test.environment`（`jsdom`/`node`）。
   - 使用 `alias` 对齐构建工具；开启 `coverage` 并配置阈值。
4. **执行命令**
   - 单次运行：`npx vitest run --dir packages/ui`.
   - 覆盖率：`npx vitest run --coverage --coverage.reporter=text-summary`.
   - 类型检查：`npx vitest --typecheck`.
5. **性能优化**
   - 利用 `--threads` 控制并行度；对资源密集测试使用 `--pool=threads`.
   - 将慢测试标记为 `test.sequential` 或 `test.runIf`.

## 质量校验
- 测试需先失败后成功，附上失败日志。
- 覆盖率达成约定阈值（≥80%，库≥90%）。
- `vitest run`、`eslint`、`tsc` 同步通过。

## 失败与回滚
- 测试不稳定：查找异步竞态、未清理定时器，必要时使用 `waitFor`。
- Mock 泄漏：在 `afterEach` 重置模拟；若问题持续，回滚测试改动。
- 配置变动导致运行失败：恢复 `vitest.config.ts`，逐项排查。

## 交付物
- 测试清单与覆盖率报告。
- Mock/测试工具配置说明。
- 若新增测试命令或脚本，提供使用方法。
