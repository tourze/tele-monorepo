---
name: python-playwright-webapp
description: 使用 Python + Playwright 对本地或开发环境的 Web 应用执行端到端验证、调试与截图回溯。
---

# Python Playwright Web 应用测试技能

## 适用场景
- 需要快速验证前端关键用户路径、表单流程或可视化模块的行为。
- 本地开发环境或 Preview 站点存在交互异常，需要复现并采集证据。
- 发布前进行烟囱式 E2E 验收，补充单元/集成测试的盲区。

## 前置准备
- Python 3.9+ 与 `playwright`、`pytest-playwright`（可选）已安装：`pip install playwright pytest-playwright`。
- 首次使用需安装浏览器内核：`playwright install --with-deps chromium`。
- 明确待测 Web 应用的启动命令、端口、登录凭据与关键页面路径。
- 约定输出目录：截图、HTML dump、日志统一存放 `tmp/playwright/<timestamp>/` 便于归档。

## 操作步骤
1. **判定页面类型**
   - 纯静态 HTML：直接读取源码定位选择器，脚本仅需加载 `file://` 或指定路径。
   - 动态应用：必须等待 `networkidle` 并通过截图/DOM dump 先勘察再执行操作。
2. **管理被测服务**
   - 未启动服务时，以 `python scripts/with_server.py --server "npm run dev" --port 5173 -- python tests/e2e/test_xxx.py` 形式同时托管服务与脚本。
   - 多服务依赖（前后端）按顺序追加 `--server` 参数，确保端口健康探测通过。
3. **编写 Playwright 脚本**
   - 统一使用 `sync_playwright()`，浏览器默认 `headless=True`；必要时增加 `slow_mo` 帮助观察。
   - 进入页面后调用 `page.wait_for_load_state('networkidle')`，再执行 DOM 探查：`page.screenshot(...)`、`page.content()`、`page.locator('role=button').all_text_contents()`。
   - 操作前写出明确的断言与日志：`assert page.locator("text=提交成功").wait_for(timeout=5000)`；异常时捕获 `console`、`network` 日志写入文件。
4. **复用脚本资源**
   - 常见操作（登录、填表、上传）封装为函数或 PyTest fixture，提高复用率。
   - 若脚本过长，将页面元素映射拆到专属模块，命名为 `pages/<PageName>.py`。
5. **执行与回溯**
   - 运行前执行 `--headed` 干预确认选择器稳定，再切回 headless。
   - 失败时保留 `traces.zip`：`context.tracing.start()` → 测试结束写入文件，方便复查。

## 质量校验
- 脚本提交前执行：`pytest tests/e2e --maxfail=1 --disable-warnings -q`。
- 重要流程至少包含一个截图和 DOM dump；附件引用写入测试报告。
- 对慢速或不稳定接口加入重试/退避逻辑，避免误报。

## 常见问题与处理
- **元素定位失败**：优先使用语义化 selector，如 `get_by_role`/`get_by_label`，必要时与开发协作补充 `data-testid`。
- **认证流程复杂**：将种子账号写入 `.env`，脚本读取后立即掩码输出，禁止写入仓库。
- **多语言界面**：脚本应依赖稳定的标识（role、aria-label），或在测试前固定语言参数。

## 交付物
- Playwright 脚本与复用模块。
- `README` 或 Runbook，记录启动命令、环境变量、关键参数。
- 最新一次执行的截图、日志、trace 包路径，支持回归复现。
