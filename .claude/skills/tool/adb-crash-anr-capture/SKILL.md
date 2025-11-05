---
name: tool-adb-crash-anr-capture
description: 收集崩溃/ANR 的关键证据（crash 日志、ANR traces、tombstones/bugreport），统一打包到 /tmp，便于复现与分享。
allowed-tools: Bash(*), Read(*), TodoWrite
---

# ADB 崩溃与 ANR 证据采集技能（Crash/ANR Capture）

## 适用场景

- 复现原生崩溃、JS 崩溃、ANR 卡死并提取一键证据包。
- CI/本地构建后冒烟时自动抓取异常并归档。
- 与日志窗口、性能采样组合，形成链路证据。

## 前置准备

- `adb devices` 可用，目标包名（示例：`com.telescope.pro`）。
- 理解权限限制：部分路径（如 `/data/tombstones`）在用户版设备上不可读，需使用 bugreport 兜底。

## 操作步骤

### 1. 变量与目录

```bash
PKG=com.telescope.pro
TS=$(date +%s)
BASE=/tmp/adb_crash_${PKG}_${TS}
mkdir -p "$BASE"
```

### 2. Crash/ANR 日志缓冲导出

```bash
# Crash 缓冲：
adb logcat -b crash -v time -d \
  | tee "$BASE/logcat_crash.txt"

# 主缓冲中高优先级（含 JS/原生错误）：
adb logcat -v time -d '*:E' \
  | tee "$BASE/logcat_errors.txt"

# 设备与进程快照：
adb shell ps -A | tee "$BASE/ps_all.txt"
adb shell dumpsys activity processes | tee "$BASE/dumpsys_activity_processes.txt"
```

### 3. ANR Traces 与 Tombstones

```bash
# ANR traces（通常位于 /data/anr/traces.txt，可读性依设备而定）
adb shell ls -l /data/anr/ 2>/dev/null | tee "$BASE/anr_dir.txt" || true
adb shell cat /data/anr/traces.txt 2>/dev/null \
  | tee "$BASE/anr_traces.txt" || echo "ANR traces 不可读或不存在" | tee -a "$BASE/_notes.txt"

# Tombstones（可能需要 root/userdebug；不可读则跳过并走 bugreport）
mkdir -p "$BASE/tombstones"
adb shell ls -1 /data/tombstones 2>/dev/null \
  | tee "$BASE/tombstones/list.txt" || true
adb pull /data/tombstones "$BASE/tombstones" 2>/dev/null || echo "tombstones 无法拉取（权限/设备限制）" | tee -a "$BASE/_notes.txt"
```

### 4. Bugreport 兜底（较大，耗时）

```bash
# 生成并拉取 bugreport（包含系统范围日志、ANR/Crash 信息）
adb bugreport "$BASE/bugreport_${TS}" >/dev/null 2>&1 || true
```

### 5. 打包归档

```bash
ARCHIVE=/tmp/adb_crash_pack_${PKG}_${TS}.tar.gz
tar -czf "$ARCHIVE" -C "$BASE" .
echo "证据包：$ARCHIVE"
```

## 质量校验

- 证据目录 `$BASE` 中至少包含 `logcat_crash.txt` 或 `logcat_errors.txt`。
- 若具备权限则包含 `anr_traces.txt` 与 `tombstones` 目录；否则存在 `bugreport_*`。
- 打包文件 `adb_crash_pack_<pkg>_<ts>.tar.gz` 可解压并查看。

## 失败与回滚

- 用户版设备权限受限：依赖 `adb bugreport` 作为兜底。
- 缓冲过期：尽快在复现后采集；或先执行 `adb logcat -c` 清缓冲再复现（注意影响其他并行调试）。
- 证据过大：分离日志与系统报告，必要时仅提供 crash 片段。

## 交付物

- `/tmp/adb_crash_pack_<pkg>_<ts>.tar.gz` 一体化证据包。
- 未打包前的原始目录 `$BASE`（便于增量补充）。

