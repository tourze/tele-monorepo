---
name: python-data-engineering
description: 当需要设计与维护 Python 数据管道，覆盖 ETL、调度、数据质量与性能优化时，请加载本技能。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
---

# Python 数据工程技能

## 适用场景

- 构建或维护批处理/流式 ETL。
- 使用 pandas、PySpark、Airflow、Prefect 等工具。
- 保障数据质量、性能、幂等与可观测性。

## 前置准备

- 明确数据源（数据库、对象存储、API）与目标仓库。
- 配置虚拟环境，安装所需库（pandas、sqlalchemy、airflow、prefect 等）。
- 确定调度平台、运行窗口、资源限制。

## 操作步骤

1. **管道设计**
   - 定义数据流程：源 → 清洗 → 转换 → 装载，绘制数据流图。
   - 拆分任务为可重用函数，遵循幂等设计（分区、批次 ID）。
2. **数据访问**
   - 使用 SQLAlchemy/psycopg2/pymysql 进行参数化查询。
   - 对大数据量使用分页/流式读取，避免一次性加载。
   - 与对象存储交互时使用分区路径、并发上传。
3. **数据质量**
   - 编写断言：行数、字段范围、唯一性、外键引用。
   - 使用 `great_expectations` 或自定义校验模块。
   - 将校验结果写入监控或数据质量仪表盘。
4. **性能优化**
   - pandas：向量化操作、`read_csv` dtype 指定、分块处理。
   - PySpark：合理分区、cache、broadcast join。
   - 并发处理：`concurrent.futures`、`asyncio`，控制连接池。
5. **调度与运维**
   - Airflow：DAG 定义、任务依赖、重试策略、`XCom` 使用。
   - Prefect：Flow/Task、状态持久化、失败通知。
   - 编写 Runbook：启动、暂停、补数据、回滚步骤。
6. **监控与日志**
   - 结构化日志记录批次 ID、分区、耗时、行数。
   - RED/USE 指标：吞吐、延迟、错误率。
   - 设定重试、报警阈值，确保异常及时发现。

## 质量校验

- 单元/集成测试：对 ETL 函数使用 pytest + 数据夹具。
- 端到端验证：在测试环境跑通一整条管道。
- 数据质量断言全部通过，无警告。

## 失败与回滚

- 数据出错：使用备份或重跑指定批次；必要时回滚到上一版本数据。
- 调度失败：立即告警，手动触发补跑，并记录原因。
- 性能不足：扩容资源或优化代码；恢复旧版本以保障 SLA。

## 交付物

- 管道设计文档（数据流图、任务清单）。
- 数据质量报告、监控截图。
- Runbook（补数据、回滚、重试步骤）。
