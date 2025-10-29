---
name: pdf-automation
description: 使用 Python 与命令行工具完成 PDF 的读取、合并、拆分、表单填写与批量生成。
license: 专有协议，详见 LICENSE.txt
---

# PDF 处理指南

## 概述

当需要批量处理 PDF（提取文本/表格、生成新文档、拆分合并、填表）时启用本技能。指南涵盖常用 Python 库与命令行工具。高级用法、JavaScript 方案请参考 `reference.md`，表单填写流程请阅读 `forms.md`。

## 快速入门

```python
from pypdf import PdfReader, PdfWriter

# 读取 PDF
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")

# 提取文本
text = ""
for page in reader.pages:
    text += page.extract_text()
```

## Python 库

### pypdf —— 基础操作

#### 合并 PDF
```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

#### 拆分 PDF
```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

#### 提取元数据
```python
reader = PdfReader("document.pdf")
meta = reader.metadata
print(f"Title: {meta.title}")
print(f"Author: {meta.author}")
print(f"Subject: {meta.subject}")
print(f"Creator: {meta.creator}")
```

#### 旋转页面
```python
reader = PdfReader("input.pdf")
writer = PdfWriter()

page = reader.pages[0]
page.rotate(90)  # 顺时针旋转 90°
writer.add_page(page)

with open("rotated.pdf", "wb") as output:
    writer.write(output)
```

### pdfplumber —— 文本与表格提取

#### 按版面提取文本
```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        print(text)
```

#### 提取表格
```python
with pdfplumber.open("document.pdf") as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for j, table in enumerate(tables):
            print(f"Table {j+1} on page {i+1}:")
            for row in table:
                print(row)
```

#### 高级表格处理
```python
import pandas as pd

with pdfplumber.open("document.pdf") as pdf:
    all_tables = []
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            if table:
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

if all_tables:
    combined_df = pd.concat(all_tables, ignore_index=True)
    combined_df.to_excel("extracted_tables.xlsx", index=False)
```

### reportlab —— 生成 PDF

#### 创建基础 PDF
```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

c.drawString(100, height - 100, "Hello World!")
c.drawString(100, height - 120, "This is a PDF created with reportlab")
c.line(100, height - 140, 400, height - 140)

c.save()
```

#### 多页文档
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet

doc = SimpleDocTemplate("report.pdf", pagesize=letter)
styles = getSampleStyleSheet()
story = []

story.append(Paragraph("Report Title", styles['Title']))
story.append(Spacer(1, 12))

body = Paragraph("This is the body of the report. " * 20, styles['Normal'])
story.append(body)
story.append(PageBreak())

story.append(Paragraph("Page 2", styles['Heading1']))
story.append(Paragraph("Content for page 2", styles['Normal']))

doc.build(story)
```

## 命令行工具

### pdftotext（poppler-utils）
```bash
pdftotext input.pdf output.txt              # 文本提取
pdftotext -layout input.pdf output.txt      # 保留布局
pdftotext -f 1 -l 5 input.pdf output.txt    # 指定页码
```

### qpdf
```bash
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf  # 合并
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf            # 拆分 1-5 页
qpdf input.pdf output.pdf --rotate=+90:1                # 旋转第 1 页 90°
qpdf --password=mypassword --decrypt encrypted.pdf decrypted.pdf  # 解密
```

### pdftk（若已安装）
```bash
pdftk file1.pdf file2.pdf cat output merged.pdf   # 合并
pdftk input.pdf burst                             # 拆分
pdftk input.pdf rotate 1east output rotated.pdf   # 旋转
```

## 常见任务

### 识别扫描版 PDF（OCR）
```python
# 依赖：pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

### 添加水印
```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### 导出嵌入图片
```bash
pdfimages -j input.pdf output_prefix
# 生成 output_prefix-000.jpg、output_prefix-001.jpg 等
```

### 设置密码
```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

## 速查表

| 任务 | 推荐工具 | 命令/代码 |
| --- | --- | --- |
| 合并 PDF | pypdf | `writer.add_page(page)` |
| 拆分 PDF | pypdf | 为每页写入单独文件 |
| 提取文本 | pdfplumber | `page.extract_text()` |
| 提取表格 | pdfplumber | `page.extract_tables()` |
| 生成 PDF | reportlab | Canvas / Platypus |
| 命令行合并 | qpdf | `qpdf --empty --pages ...` |
| OCR 扫描件 | pytesseract | 先转图片再识别 |
| 填写表单 | pdf-lib 或 pypdf | 详见 `forms.md` |

## 后续步骤

- 深入阅读 `reference.md` 了解 pypdfium2、pdf-lib 等高级用法。
- 填表场景务必执行 `forms.md` 指南，确保字段映射正确。
- 出现异常或性能问题时，优先检查参考文档中的排障章节。
