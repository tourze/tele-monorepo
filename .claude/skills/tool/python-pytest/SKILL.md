---
name: python-tool-pytest
description: 使用 Pytest 编写与执行测试，涵盖夹具、参数化、异步测试与覆盖率。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Pytest 测试技能

## 适用场景

- 为 Python 模块编写单元、集成、端到端测试。
- 管理夹具、参数化、标记、插件（pytest-django/asyncio）。
- 集成覆盖率、并行执行、失败调试。

## 前置准备

- 安装 `pytest`, `pytest-cov`, `pytest-asyncio`, `httpx` 等依赖。
- 目录遵循 `tests/` 或 `src/tests/` 结构，文件命名 `test_*.py`.
- 配置 `pytest.ini` 或 `pyproject.toml` 的 `[tool.pytest.ini_options]`。

## 操作步骤

1. **测试编写**
   - 使用 Arrange-Act-Assert 模式：

     ```python
     def test_create_user(client):
         payload = {"email": "a@example.com"}
         response = client.post("/users", json=payload)
         assert response.status_code == 201
     ```

   - 避免逻辑分支过多，必要时拆分测试。
2. **夹具管理**
   - 在 `conftest.py` 中定义常用夹具，作用域 `function`/`module`/`session`。
   - 使用 `yield` 清理资源；集成数据库时结合事务或 Factory Boy。
3. **参数化与标记**
   - `@pytest.mark.parametrize` 覆盖多种输入。
   - 标记慢测/集成：`@pytest.mark.slow`、`@pytest.mark.integration`。
   - 在命令中选择性运行：`pytest -m "not slow"`.
4. **异步测试**
   - 使用 `pytest.mark.asyncio`；确保事件循环配置正确。
   - 对 HTTP 客户端使用 `AsyncClient`。
5. **覆盖率与并行**
   - `pytest --cov=app --cov-report=term`.
   - 并行执行：`pytest -n auto`（需要 `pytest-xdist`）。
6. **调试技巧**
   - `pytest -k "keyword"` 运行指定测试。
   - `pytest --maxfail=1 --ff` 遇到失败立即停止并优先重跑失败用例。
   - 使用 `--pdb` 调试失败现场。

## 质量校验

- 测试全部通过，无 `xfailed`、`skipped` 除非登记例外。
- 覆盖率达到约定阈值（应用≥80%，库≥90%）。
- 异步或集成测试可靠，无随机失败。

## 失败与回滚

- 测试不稳定：定位资源竞争、时间依赖，必要时隔离环境。
- 并行执行冲突：关闭并行或调整夹具作用域。
- 覆盖率下降：新增测试或重构代码提升覆盖。

## 交付物

- 测试清单、覆盖率报告。
- 夹具/标记说明文档。
- 质量门命令与执行结果。
