---
name: python-runtime
description: 掌握 Python 运行时、解释器差异、环境管理与性能诊断，适用于服务端或数据脚本。
---

# Python 运行时技能

## 适用场景
- 明确 Python 版本、解释器（CPython/PyPy）、虚拟环境状态。
- 处理依赖冲突、包管理、虚拟环境污染。
- 分析性能瓶颈、内存泄漏、协程调度问题。

## 前置准备
- 安装 `pyenv`/`asdf` 或系统包管理器，确认 `python --version`。
- 使用 `poetry`/`pipenv`/`virtualenv` 管理隔离环境。
- 获取 `requirements.txt` 或 `pyproject.toml`。

## 操作步骤
1. **环境勘察**
   - 查看解释器：`python -VV`、`which python`。
   - 列出虚拟环境：`pyenv versions` 或 `pipenv --venv`。
   - 检查已安装包：`pip list` 或 `poetry show --tree`。
2. **依赖管理**
   - 使用锁文件固定版本：`poetry lock`、`pipenv lock`。
   - 安装依赖：`poetry install --with dev` 或 `pip install -r requirements.txt`。
   - 清理污染：`pip check`、`pip cache purge`、重建虚拟环境。
3. **配置与调试**
   - 环境变量：`.env` + `python-dotenv`，确保敏感信息仅在运行时加载。
   - 日志：统一使用 `logging` 模块，配置格式、level、handler。
4. **性能诊断**
   - CPU：`python -m cProfile -o profile.out script.py` + `snakeviz profile.out`。
   - 内存：`pip install memory-profiler`，使用 `@profile` 或 `mprof run`。
   - 异步：`asyncio` 应用启用 `PYTHONASYNCIODEBUG=1` 观察未 awaited 协程。
5. **部署要点**
   - 使用 `gunicorn`/`uvicorn` 时配置 `workers`、`worker-class`。
   - Docker 镜像：选择 slim 基础镜像，开启 `PYTHONUNBUFFERED=1`、`PYTHONDONTWRITEBYTECODE=1`。
   - 启用 `multiprocessing.set_start_method("spawn")` 避免 Unix fork 遗留。

## 质量校验
- `python -m compileall src/` 验证语法。
- 执行 `ruff`、`mypy`、`pytest` 等质量门（参见对应工具技能）。
- 对关键脚本运行基准测试，记录耗时、内存。

## 失败与回滚
- 依赖升级失败：记录冲突包，回退锁文件并创建治理计划。
- 性能调优无效：恢复原配置，保留 benchmark 数据。
- 虚拟环境损坏：删除 `.venv` 并重新创建。

## 交付物
- 环境说明：Python 版本、依赖、虚拟环境路径。
- 性能/调试报告与命令输出。
- 回滚与重建步骤。
