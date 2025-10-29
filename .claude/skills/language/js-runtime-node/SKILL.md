---
name: js-runtime-node
description: 理解 Node.js/V8 运行时与事件循环，用于处理异步、性能、内存与进程管理问题。
---

# Node.js 运行时技能

## 适用场景
- 分析事件循环行为、任务队列、Promise 处理顺序。
- 排查 CPU 密集型任务阻塞、内存泄漏、文件句柄耗尽等问题。
- 配置 Node 进程参数、Cluster/PM2、Docker 容器资源。

## 前置准备
- 安装目标 Node 版本，使用 `nvm` 或 `asdf` 管理多版本。
- 了解应用入口脚本与依赖（`package.json`）。
- 具备对生产/预发环境的监控与日志访问权限。

## 操作步骤
1. **版本与依赖**
   - `node -v`、`npm ls`/`pnpm list` 记录版本。
   - 检查 `engines` 字段与锁文件是否一致。
2. **事件循环剖析**
   - 通过 `setTimeout`/`setImmediate`/`process.nextTick` 示例验证任务顺序。
   - 使用 `node --trace-event-categories v8,node,node.async_hooks` 生成 trace，导入 Chrome DevTools 分析。
3. **异步陷阱排查**
   - 未处理 Promise：启用 `--unhandled-rejections=strict`。
   - 流处理：确保正确监听 `error` 事件并调用 `pipeline`。
4. **性能与资源**
   - CPU 分析：`node --inspect app.js` → Chrome DevTools Performance。
   - 内存：`--inspect` + Heap Snapshot，或 `clinic heapprofiler`.
   - 阻塞检测：`clinic flame`、`0x` 生成 Flamegraph。
5. **进程管理**
   - Cluster：避免共享状态；使用 `worker.send` 保证消息传递。
   - PM2：`pm2 start ecosystem.config.cjs`，配置 `max_memory_restart`。
   - Docker：设置 `NODE_OPTIONS="--max-old-space-size=2048"` 控制内存。
6. **错误处理**
   - 捕获未捕获异常：`process.on('uncaughtException', handler)`（仅用于记录，仍需退出）。
   - SIGTERM 处理：监听 `process.on('SIGTERM')`，执行优雅关闭。

## 质量校验
- 使用 `npm run lint`、`npm test` 验证修改未破坏质量门。
- 通过 `node --check app.js` 检查语法（ESM/TS 需 Transpile）。
- 对关键路径添加性能基线：记录 RED 指标（Rate/Error/Duration）。

## 失败与回滚
- 参数调整导致性能下滑时恢复旧参数，再排查根因。
- 监控指标恶化立即回滚部署，保留 heap/cpu profile 供后续分析。
- Cluster/PM2 配置回滚至上一版 JSON/JS 文件，reload 服务。

## 交付物
- 运行时诊断报告：版本、配置、事件循环分析结果。
- 调优方案与监控对比数据。
- 回滚步骤与后续观察项。
