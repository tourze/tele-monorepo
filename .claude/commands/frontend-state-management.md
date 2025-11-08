---
description: 设计和实施统一的状态管理架构，调度状态管理相关技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), TodoWrite, Bash(*)
argument-hint: [state-management-plan.md] [--framework <redux|zustand|mobx|context>] [--scope <glob>] [--strict] [--output <file>]
---

# 前端统一状态管理

## 参数

- **必填**：状态管理计划文件路径或关键词（定位/新建状态管理方案）。
- **可选**：`--framework <redux|zustand|mobx|context>` 指定状态管理框架。
- **可选**：`--scope <glob>` 指定作用范围（特定目录或组件）。
- **可选**：`--strict` 严格模式，要求100%类型覆盖和测试。
- **可选**：`--output <file>` 输出实施报告。

## 加载技能

- `scenario-frontend-state-management` : 提供状态管理架构设计流程与最佳实践。
- `js-react-state-management` : React状态管理具体实现指导（Redux、Zustand、Context等）。
- `js-typescript` : 状态管理相关的TypeScript类型设计。
- `test-frontend-unit` : 状态管理单元测试（actions、reducers、selectors等）。
- `quality-gate-typescript` : 状态管理代码质量门禁。
- `performance-frontend-state` : 状态管理性能优化。

## 流程概览

1. **现状分析与架构设计**：
   - 扫描现有状态管理实现（Redux、Context、local state）
   - 识别状态碎片化、重复逻辑、性能瓶颈
   - 设计统一状态管理架构和分层策略

2. **状态模型设计**：
   - 定义全局状态、模块状态、组件状态边界
   - 设计状态结构、actions、selectors规范
   - 建立状态更新流程和数据流图

3. **实施与重构**：
   - 创建统一的状态管理基础设施
   - 迁移现有状态逻辑到新架构
   - 优化性能（memoization、lazy loading、分片）

4. **质量保障与测试**：
   - 编写状态管理单元测试和集成测试
   - 配置状态管理开发工具（Redux DevTools等）
   - 性能监控和调试工具集成

5. **文档与规范**：
   - 编写状态管理使用指南和最佳实践
   - 建立状态管理代码规范和review checklist
   - 创建开发者工具和调试指南

## 产出

- **状态管理架构文档**：包含状态分层、数据流、模块边界
- **实施代码**：统一的store、actions、reducers、selectors
- **测试套件**：完整的单元测试和集成测试
- **开发工具配置**：调试工具、中间件、类型定义
- **使用指南**：开发规范、最佳实践、迁移指南

## 实施检查清单

### 架构设计阶段
- [ ] 现有状态管理实现调研完成
- [ ] 状态分层和边界定义清晰
- [ ] 数据流和更新流程设计完成
- [ ] 性能和扩展性考虑充分

### 代码实施阶段
- [ ] Store配置和中间件设置完成
- [ ] Actions、Reducers、Selectors实现规范
- [ ] TypeScript类型定义完整
- [ ] 错误处理和边界情况覆盖

### 测试和质量阶段
- [ ] 单元测试覆盖率达标（>90%）
- [ ] 集成测试覆盖主要场景
- [ ] 性能测试通过
- [ ] 代码质量检查通过

### 文档和工具阶段
- [ ] API文档和使用指南完整
- [ ] 开发工具和调试环境配置完成
- [ ] 团队培训材料准备就绪

## 异常处理

- **现有状态冲突**：识别冲突点，制定渐进式迁移策略
- **性能问题**：分析瓶颈，优化状态结构和更新逻辑
- **类型安全缺失**：补充TypeScript定义，确保运行时类型安全
- **团队接受度低**：提供培训材料，逐步推广新架构

## 最佳实践

1. **状态最小化**：只将必要的状态放入全局store
2. **规范化结构**：使用标准化数据结构避免嵌套过深
3. **类型安全**：充分利用TypeScript确保类型安全
4. **性能优先**：合理使用memoization和选择性订阅
5. **可测试性**：设计易于测试的状态逻辑结构
6. **开发体验**：配置完善的开发工具和调试支持

## 质量门禁标准

- 代码覆盖率：单元测试 >90%，集成测试 >80%
- 性能基准：状态更新延迟 <16ms，内存使用稳定
- 代码质量：无严重lint错误，复杂度控制在合理范围
- 类型安全：100%TypeScript覆盖，无any类型
- 文档完整：API文档覆盖率100%，示例代码可运行