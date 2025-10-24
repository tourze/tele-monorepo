# React 开发规范

## Purpose

定义 Vibe-Shell 项目中 React 应用开发的统一标准和最佳实践，确保代码质量和一致性。

## Requirements

### Requirement: 函数组件开发标准

开发者 SHALL 使用函数式组件 + Hooks 模式进行 React 组件开发。

#### Scenario: 组件定义规范
- **WHEN** 创建新的 React 组件
- **THEN** 开发者 SHALL 使用函数式组件 + Hooks 模式
- **AND** 组件命名 SHALL 使用 PascalCase 格式
- **AND** 开发者 SHALL 优先使用箭头函数定义组件

### Requirement: Props 类型定义规范

开发者 SHALL 为所有组件 Props 提供明确的类型定义。

#### Scenario: TypeScript Props 接口
- **WHEN** 定义组件 Props
- **THEN** 开发者 SHALL 使用 TypeScript 接口定义
- **AND** 接口命名 SHALL 使用 `ComponentNameProps` 格式
- **AND** 开发者 SHALL 为所有 Props 提供明确的类型定义

### Requirement: 自定义 Hooks 规范

开发者 SHALL 遵循自定义 Hooks 的命名和使用规则。

#### Scenario: Hooks 创建标准
- **WHEN** 创建可复用的状态逻辑
- **THEN** 自定义 Hook MUST 以 `use` 开头
- **AND** 开发者 SHALL 为 Hooks 提供明确的返回值类型
- **AND** Hooks SHALL 遵循 React Hooks 使用规则

### Requirement: 文件组织结构规范

开发者 SHALL 按照统一的文件组织标准来管理组件文件。

#### Scenario: 组件文件结构
- **WHEN** 创建复杂组件
- **THEN** 开发者 SHALL 按功能模块组织文件结构
- **AND** SHALL 使用 index.ts 作为入口文件
- **AND** 样式文件 SHALL 使用 `.module.less` 后缀

### Requirement: 状态管理规范

开发者 SHALL 根据项目类型使用合适的状态管理方案。

#### Scenario: UmiJS Models 使用 (utc-react)
- **WHEN** 需要全局状态管理
- **THEN** 开发者 SHALL 使用 UmiJS 内置的 model 系统
- **AND** model 文件 SHALL 放置在 `src/models/` 目录
- **AND** 开发者 SHALL 遵循 dva 模式规范

### Requirement: 样式开发规范

开发者 SHALL 遵循项目既定的 CSS 开发标准。

#### Scenario: Less Modules 使用 (utc-react)
- **WHEN** 编写组件样式
- **THEN** 开发者 SHALL 使用 CSS Modules with Less
- **AND** 文件命名 SHALL 使用 `ComponentName.module.less` 格式
- **AND** 开发者 SHALL 使用 BEM 命名规范

### Requirement: API 通信规范

开发者 SHALL 使用统一的 API 调用模式进行后端通信。

#### Scenario: 统一 API 调用 (utc-react)
- **WHEN** 进行后端 API 调用
- **THEN** 开发者 SHALL 使用 `callAPI` 工具函数
- **AND** 所有调用 SHALL 遵循 JSON-RPC 格式
- **AND** 开发者 SHALL 在 services 目录中创建专门的 API 函数

### Requirement: 代码质量控制规范

开发者 SHALL 遵循代码质量标准以确保可维护性。

#### Scenario: 行数限制遵循
- **WHEN** 编写代码文件
- **THEN** 开发者 SHALL 遵循文件行数限制 (页面组件 300行，其他 500行)
- **AND** 函数行数 SHALL 不超过限制 (工具函数 50行，其他 100行)

### Requirement: 性能优化规范

开发者 SHALL 考虑组件的性能优化。

#### Scenario: 组件优化实施
- **WHEN** 组件频繁重渲染
- **THEN** 开发者 SHALL 使用 `React.memo` 包装组件
- **AND** 对于昂贵计算 SHALL 使用 `useMemo`
- **AND** 对于函数引用 SHALL 使用 `useCallback`

### Requirement: 兼容性考虑规范

开发者 SHALL 考虑不同项目的技术栈兼容性。

#### Scenario: 依赖版本兼容
- **WHEN** 选择第三方库
- **THEN** 开发者 SHALL 考虑与 React 16 和 React 17 的兼容性
- **AND** SHALL 优先选择社区维护良好的库
- **AND** SHALL 避免引入过于沉重的依赖