# API Contracts

**Feature**: 001-nextjs-admin-dashboard

## 说明

本项目为纯前端 UI 框架，不涉及后端 API 交互。

示例页面使用前端模拟数据，无需定义 API 契约。

## 未来扩展

如需与后端集成，可在此目录添加：

- `openapi.yaml` - REST API 规范
- `graphql.schema` - GraphQL Schema
- `types.ts` - API 类型定义

## 模拟数据位置

前端模拟数据定义在：

```
src/data/mock/
├── dashboard.ts
├── list.ts
├── form.ts
├── detail.ts
└── settings.ts
```
