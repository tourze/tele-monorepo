---
name: tool-adb-logcat-triage
description: 围绕操作窗口精准采集 Android 日志，按包名/进程与标签过滤并打时间戳，输出到 /tmp 便于问题复盘与分享。
allowed-tools: Bash(*), Read(*), TodoWrite
---

# ADB 日志窗口采集与分级排障技能（Logcat Triage）

## 适用场景

- 在一次具体操作窗口内（点击/滚动/跳转）精准抓取相关日志。
- 仅针对目标包名/进程与关键标签（如 ReactNativeJS、AndroidRuntime）进行过滤。
- 输出到 /tmp，配合其他证据（截图、UI 树）进行问题复盘。

## 前置准备

- Android 设备/模拟器已开启 USB 调试，`adb devices` 可见。
- 已知目标 App 包名（示例：`com.telescope.pro`）。
- 主机具备 `grep`, `sed`, `awk`, `tar`（常规 Linux/ macOS 默认具备）。

## 操作步骤

### 1. 设定变量与进程过滤

```bash
PKG=com.telescope.pro
TS=$(date +%s)
OUT=/tmp/adb_logcat_${PKG}_${TS}.log

# 获取当前前台进程 PID（Android 8+ 推荐 --pid 过滤）
PID=$(adb shell pidof -s "$PKG" | tr -d '\r')
echo "PID=$PID 输出=$OUT"
```

### 2. 以“时间标记”开启窗口

```bash
# 方式A：以主机当前时间为窗口起点（logcat 支持 -T "5 minutes ago" 或时间戳）
MARK=$(date +"%m-%d %H:%M:%S.000")
echo "窗口起点: $MARK"

# 可选：清空缓冲区，减少历史干扰（谨慎使用，可能影响并行调试）
# adb logcat -c
```

### 3. 精准过滤并保存

```bash
# 示例1：按 PID + 关键标签 + 错误级别，窗口从 MARK 开始
adb logcat -v time --pid "$PID" -T "$MARK" \
  | grep -E "(ReactNativeJS|AndroidRuntime|JS\s*\|)" \
  | tee "$OUT"

# 示例2：按标签分级采集最近5分钟（无需 MARK）
adb logcat -v time -T '5 minutes ago' -s ReactNativeJS *:E \
  | tee "/tmp/adb_logcat_${PKG}_last5m_${TS}.log"
```

### 4. 常用补充过滤

```bash
# 仅错误/致命：
adb logcat -v time --pid "$PID" *:E -T "$MARK" | tee "/tmp/adb_logcat_${PKG}_errors_${TS}.log"

# 仅 JS 侧：
adb logcat -v time -T "$MARK" -s ReactNativeJS \
  | tee "/tmp/adb_logcat_${PKG}_rn_${TS}.log"

# 仅崩溃缓冲区（与 crash/ANR 技能互补）：
adb logcat -b crash -v time -T "$MARK" \
  | tee "/tmp/adb_logcat_${PKG}_crash_${TS}.log"
```

## 质量校验

- 输出文件生成于 `/tmp/adb_logcat_*.log`，非仓库目录。
- 日志首行时间晚于窗口起点 `MARK`，包含目标标签或 PID。
- 关键信息可被一眼定位（错误堆栈、JS 错误、原生异常）。

## 失败与回滚

- 无 PID：应用未启动或被系统回收，先启动 App 再采集。
- `-T` 不被旧版 `logcat` 支持：退回使用 `adb logcat -d` 导出后再用 `awk` 根据时间过滤。
- 日志缺失：增大缓冲 `adb logcat -G 16M` 或更频繁抓取。

## 交付物

- `/tmp/adb_logcat_<pkg>_<ts>.log` 等日志文件。
- 过滤命令行与窗口标记时间（便于复现）。

