---
name: frontend-artifact-builder
description: 以 React + Vite + Tailwind 构建可一键打包的多组件 HTML Artifact，适用于复杂交互或多页面展示。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# 前端 Artifact 交付技能

## 适用场景

- 需要在对话中交付可直接预览的复杂网页、仪表盘或交互式演示。
- 用户要求复用 shadcn/ui、Tailwind 等设计体系，保证视觉一致性。
- 需要在单个 HTML 文件内打包完整资源，便于在无依赖环境中查看。

## 前置准备

- Node.js 18+、pnpm 或 npm；确认具备 bash 环境执行脚本。
- 本地已安装 `scripts/init-artifact.sh`、`scripts/bundle-artifact.sh`（使用前先运行 `chmod +x`）。
- 明确设计规范：主题、色板、组件层级以及交互需求。
- 约定输出目录：源代码存放 `artifacts/<artifact-name>/`，打包结果产出 `bundle.html`。

## 操作步骤

1. **需求澄清**
   - 记录页面数量、导航结构、核心交互、数据源（静态/Mock/实时）。
   - 输出信息架构草图，确认优先内容与响应式需求。
2. **脚手架初始化**
   - 执行 `bash scripts/init-artifact.sh <artifact-name>` 生成项目骨架。
   - 进入目录后安装依赖（脚本会自动完成），评估是否需要额外组件或图表库。
3. **开发与组件化**
   - 遵循原子到页面分层：`components/`、`features/`、`pages/`。
   - Tailwind 类名保持语义，避免魔法数；复杂样式抽离到 `styles/variants.ts` 或配置文件。
   - 数据层可使用 `mock/` 下的 JSON 或创建 `hooks/useData.ts` 统一管理。
4. **主题与设计一致性**
   - 首选内置 shadcn/ui 组件；如需自定义，扩展 `lib/utils.ts` 与 `tailwind.config.js`。
   - 使用我们现有主题（`theme-factory` 技能）或手动定义 CSS 变量，确保对比度与品牌色符合规范。
5. **打包与验收**
   - 开发完成后运行 `bash scripts/bundle-artifact.sh`，生成单文件 `bundle.html`。
   - 本地通过 `npx serve bundle.html` 或浏览器直接打开验证交互、字体、暗色模式等表现。
   - 若包含动态数据，提供模拟数据与后续接入说明。

## 质量校验

- `npm run lint` 与 `npm run test`（如引入测试）；保证无 TypeScript 类型错误。
- 通过 Lighthouse（桌面+移动）确认性能、可访问性≥90。
- 检查打包后文件大小，目标 < 2 MB；超标时排查未压缩资源或冗余依赖。
- 确认 `bundle.html` 中所有资源均被内联，无外部网络请求。

## 交付物

- 项目源码目录（包含组件、样式、Mock 数据、README）。
- `bundle.html` 与使用说明（如何预览、如何二次开发）。
- 设计决策记录：主题选择、交互取舍、性能优化点。

## 失败与回滚

- 新依赖导致构建失败时，回到脚手架初始 commit 或最近的稳定标签，逐步恢复依赖并记录问题组件。
- `bundle.html` 校验出现功能缺失或样式错乱，应退回开发分支，迭代局部组件而非直接覆盖，确保每次变更都有截图与日志。
- Lighthouse 分数低于阈值或体积超标时，滚回优化前版本，拆分问题：移除未用组件、压缩资源、重新打包验证。
- 若需要扩展为多 Artifact，可在复原稳定版本后，将公共组件抽象到 `packages/ui`，通过 monorepo 复用并逐步推广。
