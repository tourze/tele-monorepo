---
name: xlsx-automation
description: 使用 openpyxl、pandas 与 LibreOffice 完成 Excel 文件的创建、编辑、公式校验与财务建模。
license: 专有协议，详见 LICENSE.txt
---

# XLSX 工作簿创建、编辑与分析指南

## 输出要求

### 通用规范
- **零公式错误**：交付文件必须无 `#REF!`、`#DIV/0!`、`#VALUE!`、`#N/A`、`#NAME?` 等错误。
- **尊重既有模板**：修改已有模板时需完全遵循原有格式、配色、命名；如有冲突以模板规则优先。

### 财务模型专用规范
- **颜色约定**：
  - 蓝色（RGB 0,0,255）：手动输入与场景分析参数。
  - 黑色（RGB 0,0,0）：全部公式与计算结果。
  - 绿色（RGB 0,128,0）：来自同一工作簿其他工作表的链接。
  - 红色（RGB 255,0,0）：外部引用。
  - 黄色底（RGB 255,255,0）：需关注或待更新的关键假设。
- **数字格式**：
  - 年份：使用文本表示（如 `"2024"`）。
  - 货币：使用 `$#,##0`，表头注明单位（如 `Revenue ($mm)`）。
  - 零值：统一显示为 `-`（含百分比）。
  - 百分比：默认保留一位小数（`0.0%`）。
  - 估值倍数：`0.0x`。
  - 负数：使用括号格式 `(123)`。
- **公式编写**：
  - 假设全部放在独立单元格，公式引用而非硬编码。
  - 检查引用范围、行列偏移、循环引用。
  - 以边界值（0、负数、大值）测试稳定性。
- **硬编码标注**：在相邻单元格或备注中注明来源，如：
  - `Source: Company 10-K, FY2024, Page 45, Revenue Note, https://...`
  - `Source: Bloomberg Terminal, 2025-08-15, AAPL US Equity`

## 概述

当需新建、修改或分析 `.xlsx`（含 `.xlsm`、`.csv`、`.tsv`）时启用本技能。根据任务选择 pandas、openpyxl、LibreOffice 组合。

> **公式重算依赖 LibreOffice**：`recalc.py` 脚本首次运行会自动配置 LibreOffice，请确保环境已安装。

## 数据读取与分析

### pandas 快速操作
```python
import pandas as pd

df = pd.read_excel('file.xlsx')                       # 默认首个工作表
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # 所有工作表

df.head(); df.info(); df.describe()

df.to_excel('output.xlsx', index=False)
```

## Excel 工作流

### 核心原则：始终使用 Excel 公式
禁止在 Python 中计算结果后硬编码，确保源数据变化时工作簿可自动更新。

```python
# 错误示例（硬编码结果）
sheet['B10'] = df['Sales'].sum()
sheet['C5'] = (df.iloc[-1]['Revenue'] - df.iloc[0]['Revenue']) / df.iloc[0]['Revenue']

# 正确示例（写入公式）
sheet['B10'] = '=SUM(B2:B9)'
sheet['C5'] = '=(C4-C2)/C2'
sheet['D20'] = '=AVERAGE(D2:D19)'
```

### 常规流程
1. 选库：数据处理用 pandas；需公式/格式则用 openpyxl。
2. 创建或加载工作簿。
3. 编辑数据、公式、格式。
4. 保存文件。
5. **若包含公式，必须运行重算脚本**：
   ```bash
   python recalc.py output.xlsx
   ```
6. 根据脚本返回的 JSON 修复错误，再次重算直至 `status: success`。

常见错误说明：
- `#REF!`：引用无效。
- `#DIV/0!`：除零。
- `#VALUE!`：数据类型错误。
- `#NAME?`：公式名拼写错误或功能未启用。

### 新建工作簿示例
```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

sheet['A1'] = 'Hello'
sheet['B1'] = 'World'
sheet.append(['Row', 'of', 'data'])
sheet['B2'] = '=SUM(A1:A10)'

sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')
sheet.column_dimensions['A'].width = 20

wb.save('output.xlsx')
```

### 修改现有工作簿
```python
from openpyxl import load_workbook

wb = load_workbook('existing.xlsx')
sheet = wb.active

for sheet_name in wb.sheetnames:
    sheet = wb[sheet_name]
    print(f"Sheet: {sheet_name}")

sheet['A1'] = 'New Value'
sheet.insert_rows(2)
sheet.delete_cols(3)

new_sheet = wb.create_sheet('NewSheet')
new_sheet['A1'] = 'Data'

wb.save('modified.xlsx')
```

## 公式重算

```bash
python recalc.py <excel_file> [timeout_seconds]
# 示例
python recalc.py output.xlsx 30
```

脚本功能：
- 首次运行自动配置 LibreOffice 宏。
- 重算所有工作表公式。
- 扫描并统计所有错误，返回 JSON。
- 支持 Linux 与 macOS。

## 公式验证清单

### 基础检查
- [ ] 抽查 2–3 个引用单元格，确认指向正确。
- [ ] 核对列号（Excel 第 64 列为 `BL` 而非 `BK`）。
- [ ] 记得行号从 1 开始（DataFrame 行 5 对应 Excel 行 6）。

### 常见踩坑
- [ ] 使用 `pd.notna()` 处理空值。
- [ ] FY 列通常在 50 列以后，注意索引。
- [ ] 查询多次匹配时要全局搜索。
- [ ] 除法前检查分母是否为 0。
- [ ] 核对跨表引用格式，如 `Sheet1!A1`。

### 测试策略
- [ ] 小范围试算，再向下填充。
- [ ] 检查公式依赖的所有单元格是否存在。
- [ ] 用 0、负数、极大值验证稳定性。

### 读取 `recalc.py` 输出
```json
{
  "status": "success",
  "total_errors": 0,
  "total_formulas": 42,
  "error_summary": {
    "#REF!": {
      "count": 2,
      "locations": ["Sheet1!B5", "Sheet1!C10"]
    }
  }
}
```
当 `status` 为 `errors_found` 时，根据 `error_summary` 定位修复。

## 最佳实践

### 库选择
- `pandas`：批量数据处理、统计分析、导入导出。
- `openpyxl`：精细格式、公式编写、工作表结构操作。

### openpyxl 注意事项
- 行列索引从 1 开始。
- 读取公式结果需 `data_only=True`，但保存时会丢失公式，谨慎使用。
- 大文件读写使用 `read_only=True` 或 `write_only=True`。
- 公式仅存储字符串，需配合 `recalc.py` 重算。

### pandas 注意事项
- 指定列类型避免推断错误：`dtype={'id': str}`。
- 大文件可指定列：`usecols=['A', 'C', 'E']`。
- 日期列使用 `parse_dates`。

## 代码风格
- Python 脚本保持精简、无冗余日志。
- 复杂公式处在单元格内添加注释或旁注说明来源。
- 对硬编码数值记录来源与更新时间。

## 交付物
- 更新后的 Excel 文件、相关脚本或 Notebook。
- `recalc.py` 输出日志与错误处理记录。
- 若涉及财务模型，提供假设说明与回滚方案。
