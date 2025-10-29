---
name: docx-automation
description: 使用 OOXML 与脚本工具完成 DOCX 文档的创建、编辑、审阅与内容分析。
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Bash(*), Glob(*), Grep(*), TodoWrite
license: 专有协议，详见 LICENSE.txt
---

# DOCX 文档创建、编辑与分析指南

## 适用场景

- 用户要求读取、批量分析、编辑或生成 `.docx` 文档。
- 需要对法律、学术、政企文档进行精确修订并保留红线轨迹。
- 需要将 DOCX 转换为 Markdown、图片或其他格式以便审阅或集成。

DOCX 实际上是一个包含 XML 与资源文件的 ZIP 压缩包，可通过脚本或库进行读取与写入。

## 前置准备

- 安装并验证依赖：
  - `pandoc`、LibreOffice、Poppler (`pdftoppm`)
  - Node `docx` 包、Python `defusedxml` 及仓库中提供的 `ooxml` 脚本
- 确认具备文件读写与解压权限，准备工作目录（避免在原文件上直接操作）。
- 阅读 `docx-js.md` 与 `ooxml.md`，了解库的限制、命名空间与安全注意事项。
- 备份原始 DOCX，或在版本控制中创建分支/快照，确保可随时回滚。

## 操作步骤

1. **选择流程**
   - 根据需求选择“阅读与分析”“创建全新文档”“编辑现有文档”“红线审阅”“格式转换”等章节。
2. **准备环境**
   - 复制原始文件到工作目录，执行解包脚本或安装所需库。
3. **执行任务**
   - 按所选流程的详细指导操作，分批对改动脚本化并记录日志。
4. **验证结果**
   - 通过 `pandoc --track-changes=all`、LibreOffice 打开、Diff 文件等方式核对输出。
5. **归档与交付**
   - 输出最终 DOCX 及必要的 diff、脚本、打包结果；保留回滚素材。

## 工作流决策树

### 阅读或分析内容

优先参考下方“文本提取”或“原始 XML 访问”流程。

### 创建新文档

走“创建全新 Word 文档”流程。

### 编辑既有文档

- **自己产出的文档且改动简单**：可使用“基础 OOXML 编辑”流程。
- **外部文档或需要审阅**：默认采用“红线审阅流程”（强烈推荐）。
- **法律、学术、政企文档**：必须使用“红线审阅流程”。

## 阅读与分析

### 文本提取

仅需查看正文时，可使用 pandoc 转为 Markdown，同时保留修订记录：

```bash
pandoc --track-changes=all path-to-file.docx -o output.md
# 可选项：--track-changes=accept / reject / all
```

### 原始 XML 访问

需要查看评论、复杂格式、结构、嵌入媒体或元数据时需解包 DOCX：

#### 解包命令

```bash
python ooxml/scripts/unpack.py <office_file> <output_directory>
```

#### 关键文件

- `word/document.xml`：主体内容
- `word/comments.xml`：评论
- `word/media/`：嵌入的图片及媒体
- 修订：`<w:ins>` 表示插入，`<w:del>` 表示删除

## 创建全新 Word 文档

推荐使用 `docx` JavaScript/TypeScript 库（参见 `docx-js.md`）。

### 流程

1. **【强制】完整阅读** [`docx-js.md`](docx-js.md)（约 500 行），禁止截取片段。掌握语法、格式规则与最佳实践后再操作。
2. 新建 JS/TS 脚本，使用 `Document`、`Paragraph`、`TextRun` 等组件构建内容。
3. 使用 `Packer.toBuffer()` 导出 `.docx`。

## 编辑现有 Word 文档

优先使用文档库（Python 版本，详见 `ooxml.md`），可在高级场景下直接操控 DOM。

### 流程

1. **【强制】完整阅读** [`ooxml.md`](ooxml.md)（约 600 行），禁止截取片段。重点关注文档库 API 与 XML 模式。
2. 解包：`python ooxml/scripts/unpack.py <office_file> <output_directory>`
3. 编写 Python 脚本，调用文档库接口（参考 `ooxml.md`“Document Library”章节）。
4. 打包：`python ooxml/scripts/pack.py <input_directory> <office_file>`

文档库提供常见操作的封装，也支持直接访问底层 DOM。

## 红线审阅流程（Tracked Changes）

此流程支持在 Markdown 中规划批量修订，再通过 OOXML 精准落地。**务必一次性实现所有计划改动。**

**批次策略**：每批 3–10 个相关改动，便于排错与回滚。每批执行后检查再继续。

**极简原则**：仅为实际变动标记修订，不要包裹未修改文本。保留原 `<w:r>` 的 `rsid`，以免整段重写。

示例——将 “30 days” 改为 “60 days”：

```python
# 错误：整句替换
'<w:del><w:r><w:delText>The term is 30 days.</w:delText></w:r></w:del><w:ins><w:r><w:t>The term is 60 days.</w:t></w:r></w:ins>'

# 正确：仅对数字设置修订，并保留未改动部分
'<w:r w:rsidR="00AB12CD"><w:t>The term is </w:t></w:r><w:del><w:r><w:delText>30</w:delText></w:r></w:del><w:ins><w:r><w:t>60</w:t></w:r></w:ins><w:r w:rsidR="00AB12CD"><w:t> days.</w:t></w:r>'
```

### 修订流程步骤

1. **生成 Markdown 视图**：

   ```bash
   pandoc --track-changes=all path-to-file.docx -o current.md
   ```

2. **识别并分组改动**：
   - 参考章节号、段落编号、上下文关键字定位
   - 禁止依赖 Markdown 行号
   - 按章节、类型或页码分批（3–10 个改动/批）
3. **阅读文档并解包**：
   - **【强制】完整阅读** [`ooxml.md`](ooxml.md)。
   - 解包：`python ooxml/scripts/unpack.py <file.docx> <dir>`
   - 记录脚本建议的 RSID，后续修订沿用。
4. **分批实现改动**：
   - 在 `word/document.xml` 中 grep 确认当前文本切分。
   - 使用 `get_node` 查找节点，脚本中应用插入/删除标签，最后 `doc.save()`。
   - 每批结束立即验证再继续下一批。
5. **重新打包**：

   ```bash
   python ooxml/scripts/pack.py unpacked reviewed-document.docx
   ```

6. **终检**：

   ```bash
   pandoc --track-changes=all reviewed-document.docx -o verification.md
   grep "原始短语" verification.md     # 应找不到
   grep "替换后短语" verification.md   # 应找到
   ```

   确认无意外改动后再交付。

## 将文档转换为图片

用于视觉检查或生成预览：

1. DOCX 转 PDF：

   ```bash
   soffice --headless --convert-to pdf document.docx
   ```

2. PDF 转 JPEG：

   ```bash
   pdftoppm -jpeg -r 150 document.pdf page
   ```

   输出 `page-1.jpg`、`page-2.jpg` 等。

常用参数：

- `-r 150`：分辨率 150 DPI，可按需求调整
- `-jpeg`：输出 JPEG（若需 PNG 使用 `-png`）
- `-f N`：起始页
- `-l N`：结束页
- `page`：输出文件前缀

示例：

```bash
pdftoppm -jpeg -r 150 -f 2 -l 5 document.pdf page
```

## 代码风格约束

- 保持脚本精简，变量命名清晰。
- 避免冗余操作与多余日志。
- 结构化记录输入输出路径，便于复现。

## 依赖项

- `pandoc`：`sudo apt-get install pandoc`
- `docx`（Node 包）：`npm install -g docx`
- LibreOffice：`sudo apt-get install libreoffice`
- Poppler 工具：`sudo apt-get install poppler-utils`
- `defusedxml`：`pip install defusedxml`

## 质量校验

- 使用 `pandoc --track-changes=all` 或 Word 对比功能，确认改动仅包含计划内内容。
- 打开最终 DOCX，检查目录、样式、分页、字体是否正常；如需，导出 PDF/图片验收。
- 在脚本执行日志中记录输入输出路径、批次编号、验证命令，确保可追溯。
- 对审阅流程，确认 Track Changes 状态开启，修订者信息正确，未出现未处理冲突。

## 交付物

- 修改或生成的 DOCX 文件及脚本。
- 如进行审阅，附上 Markdown diff 与验证日志。
- 回滚方案：保留原文件与每批脚本记录，确保可快速恢复。

## 失败与回滚

- 发现脚本误改或结构损坏，立即停止，使用备份/原始文件恢复并重新解包。
- 红线修订出现错位或大面积 `<w:del>`/`<w:ins>`，回滚到上一批脚本，重新核对 RSID 与节点位置。
- 转换工具失败或输出错乱时，尝试替代工具（如 LibreOffice ↔ pandoc），并记录失败日志供排查。
- 若依赖缺失导致命令不可用，补齐安装后重新执行；保持每次尝试的命令历史以便复现。
