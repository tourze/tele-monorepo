---
name: tool-adb-e2e-evidence-pack
description: 将一次端到端操作产生的“截图+UI 树+日志窗口+性能指标+设备信息”统一采集并打包，便于跨团队复现与审阅。
allowed-tools: Bash(*), Read(*), TodoWrite
---

# ADB 端到端证据打包技能（E2E Evidence Pack）

## 适用场景

- 功能/样式/交互问题的完整链路收集与分享（PR 讨论、缺陷提报）。
- 回归对比：同一剧本在两个版本之间的“证据包”对照。
- 作为 CI 冒烟失败时的标准化输出。

## 前置准备

- `adb devices` 就绪；目标包名（示例：`com.telescope.pro`）。
- 需要截图/日志/性能/设备信息的最小集合。
- 可与其他技能联动（截图、日志 triage、性能 sampler）。

## 操作步骤

### 1. 变量与目录

```bash
PKG=com.telescope.pro
TS=$(date +%s)
BASE=/tmp/e2e_pack_${PKG}_${TS}
mkdir -p "$BASE"
PID=$(adb shell pidof -s "$PKG" | tr -d '\r')
MARK=$(date +"%m-%d %H:%M:%S.000") # 日志窗口起点
echo "PID=$PID 证据目录=$BASE 窗口起点=$MARK"
```

### 2. 执行你的端到端剧本

- 建议通过宏脚本（tap/swipe/wait）或手工按既定步骤完成。
- 执行前/后可分别截图用于“前后对比”。

### 3. 采集截图与 UI 树

```bash
# 截图（完成关键步骤后执行，可多次，命名递增）
adb shell screencap -p /sdcard/screen_${TS}.png && adb pull /sdcard/screen_${TS}.png "$BASE/"

# UI 层级（uiautomator dump）
adb shell uiautomator dump /sdcard/window_dump.xml >/dev/null 2>&1 || true
adb pull /sdcard/window_dump.xml "$BASE/window_dump.xml" 2>/dev/null || true
```

### 4. 采集日志窗口

```bash
adb logcat -v time --pid "$PID" -T "$MARK" \
  | tee "$BASE/log_window.txt"

# 可追加错误级别独立文件：
adb logcat -v time -T "$MARK" '*:E' \
  | tee "$BASE/log_errors.txt"
```

### 5. 采集性能指标（轻量）

```bash
mkdir -p "$BASE/perf"
adb shell dumpsys gfxinfo "$PKG" framestats > "$BASE/perf/gfx_framestats.txt" || true
adb shell dumpsys meminfo "$PKG" > "$BASE/perf/meminfo.txt" || true
adb shell dumpsys cpuinfo | grep -i "$PKG" > "$BASE/perf/cpuinfo.txt" || true
```

### 6. 采集设备/环境信息

```bash
{
  echo "=== device ==="
  adb shell getprop ro.product.manufacturer
  adb shell getprop ro.product.model
  adb shell getprop ro.build.fingerprint
  adb shell wm size
  adb shell wm density
  echo "=== pkg ==="
  echo "$PKG"
  echo "PID=$PID"
  echo "MARK=$MARK"
} | tee "$BASE/meta.txt"
```

### 7. 打包并输出路径

```bash
ARCHIVE=/tmp/e2e_pack_${PKG}_${TS}.tar.gz
tar -czf "$ARCHIVE" -C "$BASE" .
echo "E2E 证据包：$ARCHIVE"
```

## 质量校验

- 打包文件存在且可解压，基础内容齐全：`screen_*.png`、`window_dump.xml`、`log_window.txt`、`perf/*`、`meta.txt`。
- 日志时间不早于 `MARK`，屏幕截图能反映关键步骤。
- 性能采样文件可被后续对比脚本直接读取。

## 失败与回滚

- 无 PID：先启动应用或在剧本开始前取 PID；多进程 App 需指定主进程。
- `uiautomator dump` 失败：权限或当前窗口限制，继续保留其他证据并在 `meta.txt` 备注。
- 打包过大：可删除 `perf/*` 或仅保留一张关键截图。

## 交付物

- `/tmp/e2e_pack_<pkg>_<ts>.tar.gz` 标准化证据包。
- 未压缩目录 `/tmp/e2e_pack_<pkg>_<ts>/`（便于二次补充）。

