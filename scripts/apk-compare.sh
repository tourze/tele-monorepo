#!/usr/bin/env bash
# 用途：对比两个 APK（参考包 vs 新包）的结构差异，重点关注 Manifest/权限/组件、assets 与原生 so。
# 使用：bash scripts/apk-compare.sh <old.apk> <new.apk>
# 依赖（可选）：aapt、apktool、jadx、sha256sum、diff/zipcmp

set -euo pipefail

if [ $# -ne 2 ]; then
  echo "用法：$0 <参考apk> <新apk>" >&2
  exit 1
fi

OLD_APK="$1"
NEW_APK="$2"

if [ ! -f "$OLD_APK" ] || [ ! -f "$NEW_APK" ]; then
  echo "错误：APK 文件不存在：$OLD_APK 或 $NEW_APK" >&2
  exit 2
fi

WORKDIR="$(mktemp -d -t apkdiff-XXXXXX)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "[1/6] 基本信息（aapt badging）"
if command -v aapt >/dev/null 2>&1; then
  echo "-- 参考包：$OLD_APK"
  aapt dump badging "$OLD_APK" | head -n 20 || true
  echo "-- 新包：$NEW_APK"
  aapt dump badging "$NEW_APK" | head -n 20 || true
else
  echo "提示：未安装 aapt，跳过 badging 对比"
fi

echo "[2/6] 解压 APK（剔除签名文件后做粗对比）"
OLD_UNZIP="$WORKDIR/old_unzip"
NEW_UNZIP="$WORKDIR/new_unzip"
mkdir -p "$OLD_UNZIP" "$NEW_UNZIP"
unzip -qq -o "$OLD_APK" -d "$OLD_UNZIP"
unzip -qq -o "$NEW_APK" -d "$NEW_UNZIP"
rm -rf "$OLD_UNZIP"/META-INF "$NEW_UNZIP"/META-INF || true

echo "- 对比 assets 目录"
if [ -d "$OLD_UNZIP/assets" ] || [ -d "$NEW_UNZIP/assets" ]; then
  diff -qr "$OLD_UNZIP/assets" "$NEW_UNZIP/assets" || true
else
  echo "无 assets 目录"
fi

echo "- 对比原生库 lib/*.so 哈希"
find "$OLD_UNZIP" -type f -path "*/lib/*.so" -print0 | xargs -0 -I{} sha256sum "{}" | sort > "$WORKDIR/old_so.sha"
find "$NEW_UNZIP" -type f -path "*/lib/*.so" -print0 | xargs -0 -I{} sha256sum "{}" | sort > "$WORKDIR/new_so.sha"
echo "-- 参考包 so（前10行）："; head -n 10 "$WORKDIR/old_so.sha" || true
echo "-- 新包 so（前10行）："; head -n 10 "$WORKDIR/new_so.sha" || true
echo "-- so 差异："; diff -u "$WORKDIR/old_so.sha" "$WORKDIR/new_so.sha" || true

echo "[3/6] apktool 解码 Manifest 与资源（如已安装）"
if command -v apktool >/dev/null 2>&1; then
  OLD_DEC="$WORKDIR/old_dec"; NEW_DEC="$WORKDIR/new_dec"
  apktool d -f -o "$OLD_DEC" "$OLD_APK" >/dev/null
  apktool d -f -o "$NEW_DEC" "$NEW_APK" >/dev/null
  echo "- Manifest 差异（上下文 5 行）："
  diff -u -U 5 "$OLD_DEC/AndroidManifest.xml" "$NEW_DEC/AndroidManifest.xml" || true
  echo "- 资产 ACL 差异："
  diff -qr "$OLD_DEC/assets" "$NEW_DEC/assets" || true
else
  echo "提示：未安装 apktool，跳过解码对比"
fi

echo "[4/6] 关键组件/权限 快速提取"
for APK in "$OLD_APK" "$NEW_APK"; do
  echo "-- $APK"
  if command -v aapt >/dev/null 2>&1; then
    aapt dump xmltree "$APK" AndroidManifest.xml | rg -n "E: (service|activity|receiver)|N: android:name|uses-permission" -n || true
  else
    echo "提示：未安装 aapt，略"
  fi
done

echo "[5/6] 代码/类（可选：jadx 导出对比）"
if command -v jadx >/dev/null 2>&1; then
  OLD_JAVA="$WORKDIR/old_java"; NEW_JAVA="$WORKDIR/new_java"
  jadx -q -d "$OLD_JAVA" "$OLD_APK" >/dev/null || true
  jadx -q -d "$NEW_JAVA" "$NEW_APK" >/dev/null || true
  echo "- 类文件数量："
  OLD_CNT=$(find "$OLD_JAVA" -type f -name "*.java" | wc -l | awk '{print $1}')
  NEW_CNT=$(find "$NEW_JAVA" -type f -name "*.java" | wc -l | awk '{print $1}')
  echo "参考包：$OLD_CNT，新包：$NEW_CNT"
  echo "- 包分布（top 10）："
  (cd "$OLD_JAVA" && rg -n "^package " -S | awk '{print $2}' | sed 's/;//' | sort | uniq -c | sort -nr | head -n 10) | sed 's/^/OLD\t/'
  (cd "$NEW_JAVA" && rg -n "^package " -S | awk '{print $2}' | sed 's/;//' | sort | uniq -c | sort -nr | head -n 10) | sed 's/^/NEW\t/'
else
  echo "提示：未安装 jadx，跳过源码层对比"
fi

echo "[6/6] zip 级差异（忽略签名后）"
if command -v diffoscope >/dev/null 2>&1; then
  diffoscope --exclude-directory-metadata=yes --exclude 'META-INF/*' "$OLD_APK" "$NEW_APK" || true
else
  echo "提示：未安装 diffoscope，可使用 zipcmp 或 diff -qr 对 $OLD_UNZIP 与 $NEW_UNZIP 进行进一步比对"
fi

echo "完成：临时目录 $WORKDIR 已创建（脚本退出后自动清理）"

