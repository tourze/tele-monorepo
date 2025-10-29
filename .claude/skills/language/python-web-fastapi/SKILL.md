---
name: python-web-fastapi
description: 使用 FastAPI 构建后端服务，聚焦依赖注入、Pydantic 模型、路由、异步与测试。
---

# FastAPI Web 技能

## 适用场景
- 新建或维护 FastAPI 项目，需要统一代码结构与质量门。
- 设计 Pydantic 模型、依赖注入、路由与权限。
- 调试性能、并发、错误处理及自动文档。

## 前置准备
- 已安装 `fastapi`, `uvicorn`, `pydantic`, `httpx` 等依赖。
- 目录结构遵循分层：`app/main.py`, `app/api`, `app/services`, `app/models`.
- 配置 `.env`、`settings.py` 或 `pydantic.BaseSettings`。

## 操作步骤
1. **应用结构**
   - `app/main.py` 创建 `FastAPI` 实例，注册路由、事件、middleware。
   - 使用 `APIRouter` 按业务模块拆分，路由文件放置在 `app/api/routes`.
2. **模型与校验**
   - 入参使用 `pydantic.BaseModel`，设置字段类型、默认值、正则校验。
   - 响应模型与数据库实体分离，防止泄露内部字段。
3. **依赖注入**
   - 使用 `Depends` 管理服务、数据库 Session、权限校验。
   - `lifespan` 管理启动与关闭事件，处理连接池/缓存。
4. **异步与性能**
   - 默认使用 `async def` Handler；调用阻塞操作时使用 `run_in_executor`。
   - 配置 `uvicorn`：`uvicorn app.main:app --workers 4 --loop uvloop --http httptools`。
   - 启用中间件记录请求耗时，结合 Prometheus/StatsD。
5. **测试与文档**
   - 使用 `pytest` + `httpx.AsyncClient` 编写 API 测试；Fixture 管理数据库事务。
   - 自动文档：`/docs`（Swagger）、`/redoc`，确保描述与示例准确。
   - 版本化 API，并保持 OpenAPI schema 最新。
6. **错误处理**
   - 自定义异常处理器（`app.add_exception_handler`），返回标准错误结构。
   - 捕获 SQL/外部服务异常，记录 traceId。

## 质量校验
- `ruff`, `mypy`, `pytest -q`, `coverage` 达标。
- 使用 `uvicorn --reload` 本地验证，确保无未处理异常。
- OpenAPI schema 校验：`python -m jsonschema` 或 `prance lint`.

## 失败与回滚
- 依赖注入失效：复查 `Depends` 顺序，必要时回退改动。
- 性能下降：使用 `uvicorn --reload` + Profiling；回滚调整并记录数据。
- 部署失败：检查 `uvicorn/gunicorn` 命令，恢复旧版本镜像。

## 交付物
- FastAPI 模块清单（路由、服务、模型）。
- 测试报告与覆盖率、OpenAPI 文档。
- 部署命令、监控与回滚说明。
