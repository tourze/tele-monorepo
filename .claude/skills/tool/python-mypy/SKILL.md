---
name: python-tool-mypy
description: 使用 MyPy 执行严格类型检查，管理配置、第三方 stub 与错误治理。
---

# MyPy 类型检查技能

## 适用场景
- 在严格模式下运行 `mypy`，确保类型安全。
- 处理第三方库缺少类型声明、stub 管理。
- 分批清理现有类型错误，建立治理计划。

## 前置准备
- 安装 `mypy`，确认 `mypy --version`。
- 在 `pyproject.toml` 或 `mypy.ini` 配置严格选项。
- 明确目标包路径（例如 `src/`, `packages/foo`）。

## 操作步骤
1. **命令执行**
   - 基础：`mypy src --config-file mypy.ini`.
   - 严格模式：加入 `--strict` 或在配置中启用。
2. **配置要点**
   ```ini
   [mypy]
   python_version = 3.11
   strict = True
   warn_unused_ignores = True
   warn_return_any = True

   [mypy-packages.legacy.*]
   ignore_missing_imports = True
   ```
   - 使用分节配置针对遗留模块暂时放宽。
3. **错误修复策略**
   - `Incompatible types`：使用 `typing.cast`、泛型、Protocol。
   - `Missing return statement`：确保所有分支返回。
   - `Any` 传播：使用 `TypedDict`, `dataclass`, `Final`。
4. **第三方 Stub**
   - 安装 `types-xxx` 包（如 `types-requests`）。
   - 无官方 stub 时，创建 `stubs/pkg/__init__.pyi`。
5. **增量治理**
   - 对错误进行分类，优先处理核心模块。
   - 建立清理任务表，记录负责人与截止时间。
6. **CI 集成**
   - 在质量门中使用 `mypy --config-file`，禁止忽略错误。
   - 输出日志保存到构建工件。

## 质量校验
- `Success: no issues found in X source files`.
- 同步运行 `ruff`、`pytest`，确保类型修复不破坏行为。
- 覆盖公共 API 的类型测试（`pytest` + `typing.assert_type`）。

## 失败与回滚
- 引入 `cast` 导致类型逃逸：重新建模或增加守卫。
- 缺失 stub 影响开发效率：创建最小 `.pyi` 并同步到仓库。
- 配置更改过严：记录错误数，制定分阶段开启计划。

## 交付物
- MyPy 执行日志、错误清单、解决方案。
- 配置文件 diff 与说明。
- 治理计划（待清理模块、负责人与时间）。
