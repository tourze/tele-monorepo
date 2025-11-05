---
name: tool-adb-performance-sampler
description: 采集帧率/卡顿/CPU/内存/GPU等关键性能指标，保存为标准化文本，支持两次采样对比，辅助定位卡顿与资源异常。
allowed-tools: Bash(*), Read(*), TodoWrite
---

# ADB 性能采样与对比技能（Performance Sampler）

## 适用场景

- 页面/交互卡顿分析：帧时间、Jank 比例、丢帧峰值。
- 资源使用回归：CPU、内存 PSS/私有脏页、线程数、句柄数。
- 复杂场景对比：修改前后/弱网前后/不同机型间的性能差异。

## 前置准备

- `adb devices` 就绪，目标包名已知（示例：`com.telescope.pro`）。
- 测试步骤稳定可复现（建议固定脚本/宏）。
- 允许执行 `dumpsys`、`top`（用户机通常允许）。

## 操作步骤

### 1. 基础变量与输出目录

```bash
PKG=com.telescope.pro
TS=$(date +%s)
OUT_DIR=/tmp/adb_perf_${PKG}_${TS}
mkdir -p "$OUT_DIR"
PID=$(adb shell pidof -s "$PKG" | tr -d '\r')
echo "PID=$PID 输出目录=$OUT_DIR"
```

### 2. 帧率与卡顿（GfxInfo）

```bash
# 清理历史帧统计（可选）
adb shell dumpsys gfxinfo "$PKG" reset >/dev/null 2>&1 || true

# 执行你的测试步骤（滑动/切页/动画等），完成后采集：
adb shell dumpsys gfxinfo "$PKG" framestats \
  > "$OUT_DIR/gfxinfo_framestats.txt"

# 提取常用指标（P50/P90/P95/P99 近似）：
awk '/^---PROFILEDATA---/{f=1;next} /^---PROFILEDATA---/{f=0} f{print}' "$OUT_DIR/gfxinfo_framestats.txt" \
  | awk -F, 'NR>1{print $14}' \
  | sort -n \
  | awk 'BEGIN{p50=p90=p95=p99=0} {a[NR]=$1} END{n=NR; if(n>0){p50=a[int(n*0.50)];p90=a[int(n*0.90)];p95=a[int(n*0.95)];p99=a[int(n*0.99)];} printf("P50=%sms P90=%sms P95=%sms P99=%sms\n",p50/1000000,p90/1000000,p95/1000000,p99/1000000)}' \
  | tee "$OUT_DIR/gfx_percentiles.txt"

# 计算 Jank 比例（简单近似：frame-dur > 16.67ms）
awk '/^---PROFILEDATA---/{f=1;next} /^---PROFILEDATA---/{f=0} f{print}' "$OUT_DIR/gfxinfo_framestats.txt" \
  | awk -F, 'NR>1{d=$14/1000000; total++; if(d>16.67) jank++} END{if(total>0) printf("Jank=%.2f%% (%d/%d)\n",100*jank/total,jank,total); else print "Jank=N/A"}' \
  | tee "$OUT_DIR/gfx_jank.txt"
```

### 3. CPU/内存/线程/句柄

```bash
# CPU：
adb shell dumpsys cpuinfo | grep -i "$PKG" \
  | tee "$OUT_DIR/cpuinfo.txt"

# 进程级 CPU/mem 快照：
adb shell top -b -n 1 | sed -n '1,200p' \
  | tee "$OUT_DIR/top_head.txt"
adb shell top -b -n 1 -H -p "$PID" | sed -n '1,200p' \
  | tee "$OUT_DIR/top_threads.txt"

# 内存明细：
adb shell dumpsys meminfo "$PKG" \
  | tee "$OUT_DIR/meminfo.txt"

# 句柄/文件描述符数（可能需要 run-as 权限，不可用则跳过）：
adb shell ls /proc/"$PID"/fd 2>/dev/null | wc -l \
  | tee "$OUT_DIR/fd_count.txt" || true
```

### 4. GPU 渲染与过绘（可选）

```bash
# 设备层面总览（不同厂商输出差异大）：
adb shell dumpsys SurfaceFlinger \
  | tee "$OUT_DIR/surfaceflinger.txt"
```

### 5. 两次采样对比（修改前后）

```bash
# 假设两次采样目录：/tmp/adb_perf_<pkg>_<tsA> 与 /tmp/adb_perf_<pkg>_<tsB>
A=/tmp/adb_perf_${PKG}_<tsA>
B=/tmp/adb_perf_${PKG}_<tsB>

echo "Gfx 百分位对比" | tee "$OUT_DIR/compare_example.txt"
paste <(sed -n '1p' "$A/gfx_percentiles.txt") <(sed -n '1p' "$B/gfx_percentiles.txt") \
  | tee -a "$OUT_DIR/compare_example.txt"

echo "Jank 对比" | tee -a "$OUT_DIR/compare_example.txt"
paste <(sed -n '1p' "$A/gfx_jank.txt") <(sed -n '1p' "$B/gfx_jank.txt") \
  | tee -a "$OUT_DIR/compare_example.txt"
```

## 质量校验

- 生成的目录位于 `/tmp/adb_perf_<pkg>_<ts>/`，包含 `gfxinfo_framestats.txt`、`gfx_percentiles.txt`、`gfx_jank.txt`、`meminfo.txt`、`cpuinfo.txt` 等。
- `gfx_percentiles.txt` 能输出 P50/P90/P95/P99；`gfx_jank.txt` 给出 Jank 比例。
- `meminfo.txt` 与 `top_threads.txt` 能用于定位异常线程/内存飙升。

## 失败与回滚

- `pidof` 返回空：App 未启动或被回收，先启动再采样。
- `gfxinfo framestats` 不支持：设备过旧，退回 `adb shell dumpsys gfxinfo <pkg>` 聚合统计。
- 权限受限：某些字段需要更高权限，尽量收集可用项并标注缺失。

## 交付物

- `/tmp/adb_perf_<pkg>_<ts>/` 目录（可直接打包分享）。
- 可选生成 `compare_example.txt` 展示基线与优化后的对比摘要。

