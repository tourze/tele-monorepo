# VibeShell

VibeShell 是一个使用 Yarn Workspaces 管理的多项目仓库，当前聚焦于微信小程序项目。通过统一的依赖与脚本配置，可快速同步、开发与构建多个业务仓库。

## 快速上手

1. 确认已安装 Yarn（建议使用 1.22 及以上版本）：
   ```bash
   yarn --version
   ```
2. 在仓库根目录安装依赖：
   ```bash
   yarn install
   ```
3. 查看已经接入的工作区项目：
   ```bash
   yarn list-projects
   ```

## 常用脚本

- `yarn clone-project <名称> <仓库地址>`：克隆新项目到 `apps/<名称>` 并记录到 `local-projects.json`
- `yarn update-project <名称>`：在 `apps/<名称>` 内执行 `git pull`
- `yarn sync-project`：根据 `local-projects.json` 批量克隆或更新项目
- `yarn dev:tkp-pp`：启动 `tkp-pp-wmp` 的开发构建
- `yarn dev:tkp-cg`：打印指引，提醒通过微信开发者工具打开 `apps/tkp-cg-wmp`
- `yarn build:tkp-pp`：打包 `tkp-pp-wmp`
- `yarn build:tkp-cg`：打印指引，提醒在微信开发者工具内完成构建
- `yarn openspec:validate`：运行 OpenSpec 校验脚本，检查工作区与规范文件
- `yarn reinstall`：清理各级 `node_modules` 与锁文件后重新安装依赖

⚠️ 仓库内所有依赖操作请使用 `yarn`，避免混用 `npm` 或 `pnpm`。

## Yarn Workspaces 常见命令

- `yarn workspaces info`：查看工作区拓扑结构与依赖信息（参考 Yarn Classic 官方文档）
- `yarn workspaces run <脚本>`：一次性在所有工作区执行同名脚本，例如 `yarn workspaces run lint`
- `yarn workspace <包名> run <脚本>`：在指定工作区内执行脚本，例如 `yarn workspace tkp-pp-wmp run build`
- `yarn workspace <包名> add <依赖>`：向某个工作区安装依赖，并自动在根目录提升共享

> 如果未来升级到 Yarn Berry（v2+），可结合 `yarn workspaces list`、`yarn workspaces foreach` 等新指令；当前仓库基于 Yarn 1.x。

## 目录结构

```
.
├── apps/                  # 微信小程序项目（Yarn 工作区之一）
├── packages/              # 预留的共享包与工具集合
├── openspec/              # 项目治理相关的规范文件
├── scripts/               # 仓库管理脚本
├── README.md              # 使用说明
└── package.json           # Yarn monorepo 配置（workspaces）
```

## OpenSpec 验证

执行 `yarn openspec:validate` 会检查：

1. `openspec/` 目录结构是否完整；
2. `apps/*` 项目中是否存在 `.openspec` 配置；
3. 根目录 `package.json` 的 Yarn Workspaces 配置是否规范；
4. 环境中是否可用 OpenSpec CLI（如未安装，会给出提示）。

## 仓库拆分工具

仓库内附带 `repo-split.sh`，可在保留提交历史的前提下将某个子目录拆分为独立仓库：

```bash
# 将 apps/utc-react 目录拆分并推送到新的远程仓库
./repo-split.sh ./ apps/utc-react https://gitee.com/yourname/utc-react.git
```

> 提示：拆分操作需要 Git 命令行环境，执行前请确认磁盘空间充足并完成源仓库备份。

## 文件访问控制 (.llmignore)

项目支持通过 `.llmignore` 文件控制 AI 对特定文件和目录的访问权限，防止重要文件被意外修改。

### 快速设置

在项目根目录创建 `.llmignore` 文件（纯文本文件），添加规则如下：

```
[no-access]
.env          # 禁止访问环境文件
secrets/**    # 禁止整个 secrets 目录

[read-only]
README.md     # 只读，不允许修改
docs/*        # docs 目录文件只读
```

### 规则说明

- **[no-access]**: 完全禁止 AI 访问匹配的文件/目录
- **[read-only]**: 允许 AI 读取但不允许修改
- 支持通配符：`*` 匹配任意字符，`**` 递归匹配目录
- 注释以 `#` 开头

### 注意事项

- `.llmignore` 文件会向上递归查找（子目录 → 父目录 → 根目录）
- 仅限制 AI 工具操作，不影响人类直接编辑
- 规则按文件层级优先级，最近的规则优先

## AI 协作提示

确保常用 AI 工具（如 Claude、Cursor、Gemini CLI）可以读取仓库中的 `AGENTS.md` 和 OpenSpec 相关文件，在提出需求或让 AI 协助开发时效果更佳。


- .claude 目录，作为一个标准化文件夹，用于管理自定义命令、代理（agents）、设置（settings.json）和记忆文件（CLAUDE.md）。这不是用户 hack，而是官方功能
- 官方文档描述：运行 claude 命令时，它会自动读取 ~/.claude/（全局目录）和项目根目录下的 .claude/，用于加载 slash 命令（如 /review）和工具集成（MCP）
- 这些文件协同工作：settings.json 定义全局规则，settings.local.json 是本地覆盖（优先级更高），而两个 Python 脚本用于技能目录（.claude/skills）的管理。
- settings.json
1. 权限控制（permissions）
2. 自动化钩子（hooks）
3. 决定 AI 能用哪些命令（权限），并在 读/写/执行前后自动跑脚本（钩子），让你在终端里拥有 CI/CD 级别的代码质量与安全保障
4. AI，你可以上网、可以跑 git/php 测试，但不准装东西、不准乱改文件；每次改代码前先检查忽略列表，改完后自动检查代码对不对，我发消息时你先想好再回答。
- permissions —— “白名单 + 黑名单” 安全门
1. allow允许 Claude 调用的工具/命令
2. deny禁止，即使在 allow 里也会被拦截
3. ask（可选）需要 用户确认 才执行
- hooks —— “事件驱动的自动化脚本”
1. PreToolUse 在工具执行前
2. PostToolUse 在工具执行后
3. UserPromptSubmit 用户输入 Prompt 时
- commands —— 它们的作用是定义和标准化自动化任务流程，帮助Claude在开发、设计和质量控制等场景中执行结构化的操作
1. fix-issue.md：用于修复GitHub Issue。流程包括解析Issue、复现问题、根因分析、代码修改、验证和报告生成。强调"先红后绿"测试（先失败再通过）和提交规范。适合bug修复场景。
2. design-review.md：设计文档评审。采用IDEC循环（Identify-Discuss-Execute-Confirm），识别问题、讨论决策、更新文档。产出评审日志和行动项，聚焦逻辑设计而非实现细节。
3. feature-validate.md：验证功能需求文档（FRD）的达标情况。检查商业价值、指标、质量门等，生成报告和修复任务。强调风险矩阵和实验设计。
4. frontend-design.md：前端组件设计文档（CRD）创建/推进。聚焦组件树、状态管理、交互流程和可视化一致性。集成React相关技能，确保a11y（可访问性）和性能要求。
5. frontend-execute.md：按CRD实施前端代码。任务分解、质量门执行、自愈修复。产出代码变更、测试集和报告，强调Hooks、样式和工具链（如ESLint、Vitest）。
6. frontend-refactor.md：前端重构规划与执行。扫描机会、任务分组、重构代码，守住性能、安全和复杂度红线。适合优化现有前端代码。
7. feature-design.md：功能需求文档（FRD）创建/推进。集成商业价值评估、可视化优化和资源规划。产出结构化FRD，包括甘特图和风险分析。
8. feature-execute.md：按FRD实施功能。任务队列执行、质量门校验、自愈和报告。覆盖代码/配置变更，强调灰度发布和单位经济。
9. fix-code.md：批量代码质量修复。循环"定位-分析-修复-回归-复盘"，批次化处理（如风格、类型、复杂度）。严格0错误标准，支持并行协作和Git自动提交。版本为v4.3，强调分支约束和测试基线。
10. frontend-validate.md：按CRD验证前端实现。差距分析、风险评估、报告生成。产出修复任务和质量门记录。
11. stm-dump.md: 用于可视化展示当前或最近完成的任务状态机流程，生成 Mermaid 图并标注当前状态，适合追踪复杂命令执行进度。
12. reflection.md: 用于工程会话复盘，分析目标完成度、阻塞、成功模式与改进点，生成结构化报告和行动清单，适合任务后回顾优化。
13. php-easyadmin.md: 用于基于实体快速生成或完善 EasyAdmin CRUD 后台管理模块，自动分层（Controller + Service）、菜单、测试与质量门，适合后台功能快速搭建。
14. gen-readme.md: 用于自动生成或更新项目 README，聚合依赖、脚本、质量门与回滚说明，生成标准 Markdown 文档，适合项目初始化或文档同步。
15. php-procedure.md: 用于生成规范的 JsonRPC Procedure 业务流程类，支持参数 DTO、缓存/锁基类、类型安全与测试，适合微服务 API 开发。
16. talk.md: 用于在需求模糊、高风险操作或多路径选择时，主动触发结构化讨论，列出风险与备选方案并确认决策，适合防止误操作与需求澄清。
17. frontend-state-management.md: 消除状态碎片化，建立可预测、可维护、可扩展的全局状态架构

- hooks 作用是 在 AI 执行特定操作（如代码生成、编辑、写入文件）时，自动拦截、验证或修改输入/输出，确保代码质量、安全性和一致性
1. force-think.js:用户提交模糊查询时，确保 AI “think hard” 以提升响应质量。
2. lint-eslint.js:AI 生成或编辑前端/Node.js 代码时，确保无 lint 错误。
3. lint-common.js:所有 lint 钩子的基础库，不单独运行。
4. lint-bash.js: AI 生成 shell 脚本时，防止语法错误导致执行失败。
5. lint-json.js: AI 生成配置/数据文件时，确保 JSON 有效。
6. lint-python.js: AI 生成 Python 脚本时，防止语法错误。
7. lint-hooks.test.js: 开发/维护钩子时运行，确保钩子可靠。
8. lint-markdown.js: AI 生成文档/README 时，提示风格问题（如标题、正文）。
9. lint-php.js: AI 生成后端 PHP 代码时，防止语法错误。
10. llmignore.js: AI 尝试写/编辑敏感文件（如 config/private/secret.txt）时，防止访问私有或关键文件。
11. lint-python.js: AI 生成或编辑 Python 代码时，防止语法错误导致运行失败。
12. phpstan-require-path.js: AI 通过 Bash 运行 phpstan 时，强制高效扫描，避免低效或风险操作。



