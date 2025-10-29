---
name: pptx-automation
description: 使用 html2pptx、Markitdown 与 OOXML 完成 PPTX 幻灯片的创建、编辑、审阅与视觉分析。
license: 专有协议，详见 LICENSE.txt
---

# PPTX 幻灯片创建、编辑与分析指南

## 概述

当需要处理 `.pptx` 文件（新建演示、改版现有幻灯片、分析主题/备注/评论）时启用本技能。PPTX 是一个包含 XML 与资源文件的 ZIP 包，可通过不同工具完成各类任务。

## 阅读与分析

### 文本提取
只需查看文字内容时，转换为 Markdown：

```bash
python -m markitdown path-to-file.pptx
```

### 原始 XML 访问
若涉及评论、讲稿、布局、动画、设计元素或复杂格式，需解包后直接查看 XML。

#### 解包命令
```bash
python ooxml/scripts/unpack.py <office_file> <output_dir>
```

> 脚本位于 `pptx/ooxml/scripts/unpack.py`，若路径变动请使用 `find . -name "unpack.py"`。

#### 关键文件结构
- `ppt/presentation.xml`：演示文稿元数据与幻灯片引用
- `ppt/slides/slide{N}.xml`：第 N 张幻灯片
- `ppt/notesSlides/notesSlide{N}.xml`：备注
- `ppt/comments/modernComment_*.xml`：评论
- `ppt/slideLayouts/`、`ppt/slideMasters/`：布局与母版
- `ppt/theme/`：主题与配色
- `ppt/media/`：图片与多媒体

#### 字体与配色
复刻示例设计时务必先解析主题：
1. 阅读 `ppt/theme/theme1.xml` 的 `<a:clrScheme>` 与 `<a:fontScheme>`。
2. 检查 `ppt/slides/slide1.xml` 中的 `<a:rPr>` 了解实际字体。
3. 使用 `grep` 搜索 `<a:solidFill>`、`<a:srgbClr>` 获取色彩分布。

## 无模板创建新演示

推荐使用 `html2pptx` 将 HTML 布局精准转换为 PPTX。

### 设计原则
在写代码前先完成设计分析并对外阐述：
1. 内容主题与语气：行业、氛围、受众是谁？
2. 品牌要求：是否提供品牌色或识别元素？
3. 色彩匹配：选择与主题契合的调色板。
4. 设计意图：在输出代码前先说明整体设计策略。

必须遵守：
- ✅ 先陈述设计方案再写代码。
- ✅ 仅使用 Web 安全字体（Arial、Helvetica、Times New Roman、Georgia、Courier New、Verdana、Tahoma、Trebuchet MS、Impact）。
- ✅ 通过字号、字重、配色建立层次。
- ✅ 保证对比度、文本尺寸、排版整洁。
- ✅ 全程保持间距、组件样式一致。

#### 色彩选择指南
- 不要默认套用常见配色，结合主题和情绪挑选颜色。
- 建议挑选 3–5 个互补颜色（主色 + 辅助色 + 点缀）。
- 检查对比度，保证文本清晰可读。
- 可参考示例配色（Classic Blue、Teal & Coral 等），也可自行设计。

#### 布局参考
- 宽屏 16:9（720×405pt）为默认画布。
- 结构可采用：全幅画面、左右分栏、网格模块、Z/F 型排版、悬浮文本框等。
- 背景处理：大面积色块、渐变、分割背景、留白等。
- 若包含图表/表格：优先使用两列布局或全幅布局，禁止把图表堆在文本下方。

### 工作流
1. **【强制】完整阅读** [`html2pptx.md`](html2pptx.md)，禁止截取片段。
2. 为每页创建 HTML（建议 720×405pt）：
   - 文本使用语义标签 `<p>`、`<h1>`~`<h6>`、`<ul>`、`<ol>`。
   - 图表/表格占位使用 `class="placeholder"` 并以灰底提示。
   - 渐变与图标需先用 Sharp 光栅化为 PNG。
   - 图表/表格页面只使用两栏或全幅布局。
3. 编写 JS 脚本调用 [`html2pptx.js`](scripts/html2pptx.js)：
   - 通过 `html2pptx()` 转换 HTML。
   - 使用 PptxGenJS 在占位区域补充图表/表格。
   - `pptx.writeFile()` 输出演示文稿。
4. **视觉校验**：
   ```bash
   python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4
   ```
   检查缩略图是否存在文本裁切、重叠、对比不足或边距异常，必要时调整 HTML 再生成。

## 编辑现有演示

需要直接操作 OOXML：

1. **【强制】完整阅读** [`ooxml.md`](ooxml.md)。
2. 解包：`python ooxml/scripts/unpack.py <office_file> <output_dir>`
3. 编辑核心 XML（`ppt/slides/slide{N}.xml` 等）。
4. 每次更改后立即验证：`python ooxml/scripts/validate.py <dir> --original <file>`
5. 打包：`python ooxml/scripts/pack.py <input_directory> <office_file>`

## 使用模板创建新演示

适用于需要遵循现有模板的场景。

### 步骤
1. **提取模板文本并生成缩略图**：
   ```bash
   python -m markitdown template.pptx > template-content.md
   python scripts/thumbnail.py template.pptx
   ```
   阅读 `template-content.md` 全文，理解内容结构。
2. **模板盘点**：基于缩略图输出 `template-inventory.md`，列举每张幻灯片（0 起始），记录布局、用途、占位符数量。
3. **编写内容大纲与模板映射**：
   - 统计实际内容项数，再选择对应布局。
   - 禁止使用占位符数量与内容不匹配的布局（如 3 列放 2 项）。
   - 将映射保存到 `outline.md`，示例：
     ```python
     template_mapping = [0, 34, 34, 50, 54]
     ```
4. **复制/重排幻灯片**：
   ```bash
   python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,54
   ```
   索引从 0 开始，可重复以复制幻灯片。
5. **提取所有文本**：
   ```bash
   python scripts/inventory.py working.pptx text-inventory.json
   ```
   阅读 JSON，了解每张幻灯片的形状、占位符、样式与默认字体。
6. **生成替换 JSON**：
   - 仅引用存在的形状（脚本会校验）。
   - 未在 JSON 中列出的形状文本会被清空。
   - 子弹列表必须设置 `"bullet": true, "level": 0`。
   - 保留对齐、字体、颜色等属性。
   - 输出为 `replacement-text.json`。
7. **应用替换**：
   ```bash
   python scripts/replace.py working.pptx replacement-text.json output.pptx
   ```
   脚本会先清空文本，再按 JSON 写入并保持格式；若形状不存在或内容溢出会报错。

## 生成缩略图

```bash
python scripts/thumbnail.py presentation.pptx [output_prefix] --cols 4
```

特性：
- 默认生成 `thumbnails.jpg`（大文件会分片）。
- 列数 3–6 可选，决定每张网格包含的幻灯片数量。
- 索引按 0 起始，便于后续定位。

用途：分析模板、总览内容、导航定位、视觉质量检查。

## 幻灯片转图片

1. PPTX → PDF：
   ```bash
   soffice --headless --convert-to pdf template.pptx
   ```
2. PDF → JPEG：
   ```bash
   pdftoppm -jpeg -r 150 template.pdf slide
   ```
   参数 `-f`、`-l` 控制页码，`-png` 可导出 PNG。

## 代码风格
- 保持脚本精简，禁止冗余变量与日志。
- 输出路径、版本号应清晰，方便回滚。

## 依赖
- `pip install "markitdown[pptx]"`：文本提取。
- `npm install -g pptxgenjs`、`npm install -g playwright`：html2pptx 渲染。
- `npm install -g react-icons react react-dom`：图标支持。
- `npm install -g sharp`：矢量转位图。
- `sudo apt-get install libreoffice`：PPTX ↔ PDF 转换。
- `sudo apt-get install poppler-utils`：`pdftoppm`。
- `pip install defusedxml`：安全 XML 解析。

## 交付物
- 输出 PPTX、缩略图、替换 JSON 与脚本。
- 记录设计决策（配色、字体、布局选择）与验证结果。
- 回滚方案：保留模板原件、`working.pptx`、替换前 JSON 及脚本日志。
