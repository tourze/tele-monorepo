---
name: tool-adb-screenshot
description: 当需要在 RN/原生 App 开发中通过 ADB 截屏、滚动定位、自动采集 UI 证据进行样式调优或异常复现时，请加载本技能。
allowed-tools: Bash(*), Read(*), TodoWrite
---

# ADB 截图辅助开发与测试技能

## 适用场景

- RN/原生 App 的 UI 调整与样式验收（像素级校对、折行/裁切问题复现）。
- 交互回归验证（点击/滚动后截屏对比）。
- 构建/安装后端到端冒烟检查（已启动、已渲染到首页等）。
- 需要通过截屏证据辅助问题定位与方案讨论。

## 前置准备

- Android 设备/模拟器已启用开发者选项与 USB 调试。
- `adb devices` 可见目标设备。
- 已知 App 包名（如 `com.telescope.pro`）。
- Metro 已运行（调试 JS 变更时需要热重载/刷新）。
- 确认 `/tmp` 目录可写，避免截图污染仓库。

## 操作步骤

### 1. 校验设备连接

```bash
# 列出已连接设备
adb devices -l

# 若设备断连，重启 ADB 服务
adb kill-server && adb start-server && adb devices
```

### 2. 启动/唤醒应用

```bash
# 通过 monkey 命令启动应用（不依赖 Activity 名）
adb shell monkey -p com.telescope.pro -c android.intent.category.LAUNCHER 1

# 或指定 Activity 启动（需明确主 Activity）
adb shell am start -n com.telescope.pro/.MainActivity

# 清除并冷启动
adb shell am force-stop com.telescope.pro && adb shell monkey -p com.telescope.pro 1
```

### 3. 截图采集

```bash
# 截图到 /tmp 目录（确保不进入仓库）
TS=$(date +%s)
adb shell screencap -p /sdcard/shot_$TS.png && \
  adb pull /sdcard/shot_$TS.png /tmp/ && \
  echo "截图已保存至：/tmp/shot_$TS.png"
```

### 4. 滚动与定位

```bash
# 上滑操作（从坐标 500,1600 滑动到 500,600，耗时 300ms）
adb shell input swipe 500 1600 500 600 300

# 下滑操作
adb shell input swipe 500 600 500 1600 300

# 点击操作（坐标 x,y）
adb shell input tap 500 1000

# 获取设备分辨率（用于计算坐标）
adb shell wm size
```

### 5. 对比截图工作流

```bash
# 变更前截图
TS1=$(date +%s)
adb shell screencap -p /sdcard/before_$TS1.png && \
  adb pull /sdcard/before_$TS1.png /tmp/ && \
  echo "变更前：/tmp/before_$TS1.png"

# 执行代码变更并触发热重载
# （或使用 adb shell input keyevent 82 打开 Dev Menu 手动 Reload）

# 变更后截图
TS2=$(date +%s)
adb shell screencap -p /sdcard/after_$TS2.png && \
  adb pull /sdcard/after_$TS2.png /tmp/ && \
  echo "变更后：/tmp/after_$TS2.png"
```

### 6. 进阶用法

```bash
# 打开开发菜单（需人工在设备上选择 Reload）
adb shell input keyevent 82

# 录屏（Ctrl+C 结束录制）
adb shell screenrecord /sdcard/demo.mp4
# 拉取录屏文件
adb pull /sdcard/demo.mp4 /tmp/
```

## 质量校验

- 截图文件成功保存至 `/tmp` 目录，未污染仓库。
- 截图内容清晰，能够定位到目标 UI 组件。
- 滚动/点击操作坐标正确，设备响应符合预期。
- 对比截图能够明确展示变更前后差异。

## 失败与回滚

- **设备断连**：执行 `adb kill-server && adb start-server && adb devices` 重连。
- **应用未启动或闪退**：检查 Logcat 日志 `adb logcat | grep -i error`，或查看 Metro 输出。
- **截图无内容或黑屏**：确认应用已完成渲染；必要时延迟 1-2 秒后再截图。
- **坐标不准确**：使用 `adb shell wm size` 获取分辨率，调整滑动/点击坐标。
- **权限问题**：确认 USB 调试已授权；部分设备需手动授权截图权限。

## 交付物

- 截图文件（存放在 `/tmp` 或指定目录，不提交到仓库）。
- 变更前后对比截图路径（用于讨论或复现）。
- 操作步骤记录（包含关键命令与设备信息）。
- 异常情况的 Logcat 日志片段（若涉及问题排查）。
