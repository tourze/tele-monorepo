# CLAUDE 运行时指导

> 本文是 Claude Code 的运行时协作指导，具体原则和治理规则请参考项目宪法 `.specify/memory/constitution.md`

## 快速参考

### 思考与回复方式
- 思考方式：使用英文来思考，使用中文来回复
- 服务对象：项目内所有与 Claude Code 协作的成员（含自动化脚本与 MCP 子代理）

### 工作流程速查

| 阶段 | 动作 | 工具/技能 |
| --- | --- | --- |
| 1. 澄清与定位 | 确认需求范围、已有上下文、风险假设 | AskUserQuestion, Read |
| 2. 计划编排 | 列出 Todo 并建立执行节奏 | TodoWrite, /speckit.specify |
| 3. 设计实现 | 生成规范、计划和任务 | /speckit.plan, /speckit.tasks |
| 4. 技能执行 | 按技能说明书执行，沉淀证据 | /speckit.implement, 相关技能 |
| 5. 复核交付 | 对照质量门，自检通过后输出 | /speckit.analyze, /speckit.checklist |

### 场景速查表

| 场景 | 首选命令/技能 | 产出要求 |
| --- | --- | --- |
| 新功能开发 | `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` | 完整的 specs/ 目录结构 |
| 需求澄清 | `/speckit.clarify` + `scenario-requirement-discovery` | 用户故事、假设、缺口列表 |
| 质量验证 | `/speckit.analyze` + `/speckit.checklist` | 质量报告、检查清单 |
| 缺陷修复 | `/fix-issue` + `scenario-bugfix-root-cause` | 最小复现案例、红绿测试、根因分析 |
| 代码审查 | `/design-review` + 相关语言技能 | 评审纪要、改进建议 |
| 发布准备 | `scenario-release-rollback` | 回滚路径、变更公告、依赖检查 |

### 技能声明规范

执行技能时必须声明：
- 首次加载：`当前技能：<技能名称>｜备注：<触发缘由>`
- 继续执行：`继续技能：<技能名称>｜<动作>`
- 切换技能：先声明新技能的加载

### Speckit 工作流

```mermaid
graph LR
    A[用户需求] --> B[/speckit.specify]
    B --> C[创建分支和spec.md]
    C --> D[/speckit.plan]
    D --> E[生成设计文档]
    E --> F[/speckit.tasks]
    F --> G[生成任务清单]
    G --> H[/speckit.implement]
    H --> I[执行实现]
    I --> J[/speckit.analyze]
    J --> K[质量分析]
    K --> L[交付]
```

### Codex MCP 协作

触发条件：
- 结论可信度 <80%
- 跨团队影响大
- 存在安全/合规疑问
- 技能内显式要求

协作前完成五项自检：
1. 证据完整性
2. 推断标注
3. 不确定点
4. 潜在偏差
5. 假设验证

## 重要提醒

- **宪法优先**：所有工程原则、质量标准、治理规则请参考 `.specify/memory/constitution.md`
- **技能为准**：遇到缺失场景，优先补齐技能（`.claude/skills/`）
- **证据驱动**：每个结论必须有命令输出或文件引用支撑
- **计划同步**：任何计划必须立即更新 TodoWrite 并启动首个动作

## 相关文档

- **项目宪法**：`.specify/memory/constitution.md` - 核心原则和治理规则
- **技能库**：`.claude/skills/README.md` - 技能组织和使用说明
- **命令文档**：`docs/claude/slash-commands.md` - 斜杠命令详细说明
- **钩子配置**：`docs/claude/hooks.md` - 自动化钩子说明
