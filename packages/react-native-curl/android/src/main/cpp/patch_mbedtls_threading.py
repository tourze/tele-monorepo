#!/usr/bin/env python3
import pathlib
import sys


def ensure_define(text: str, macro: str) -> str:
  enabled = f"#define {macro}"
  if enabled in text:
    return text
  disabled = f"//#define {macro}"
  if disabled not in text:
    raise SystemExit(f"未找到 {macro} 的默认定义，无法自动启用")
  return text.replace(disabled, enabled, 1)


def apply_patch(source_dir: pathlib.Path) -> None:
  config_path = source_dir / "include" / "mbedtls" / "mbedtls_config.h"
  if not config_path.exists():
    raise SystemExit(f"未找到 mbedtls_config.h: {config_path}")
  text = config_path.read_text()
  original = text
  text = ensure_define(text, "MBEDTLS_THREADING_C")
  text = ensure_define(text, "MBEDTLS_THREADING_PTHREAD")
  if text != original:
    header = (
      "/* react-native-curl: 自动启用线程安全编译选项，"
      "以兼容 TLS1.3 + PSA 多线程调度 */\n"
    )
    if "react-native-curl: 自动启用线程安全编译选项" not in text:
      marker = "#define MBEDTLS_THREADING_C"
      text = text.replace(marker, header + marker, 1)
    config_path.write_text(text)


def main() -> None:
  if len(sys.argv) != 2:
    raise SystemExit("用法: patch_mbedtls_threading.py <mbedtls_source_dir>")
  apply_patch(pathlib.Path(sys.argv[1]).resolve())


if __name__ == "__main__":
  main()
