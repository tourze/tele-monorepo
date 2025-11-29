#!/usr/bin/env python3
import pathlib
import sys


def apply_patch(source_dir: pathlib.Path) -> None:
  target = source_dir / "lib" / "vtls" / "mbedtls.c"
  if not target.exists():
    raise SystemExit(f"mbedtls.c 不存在: {target}")

  text = target.read_text()
  marker = "react-native-curl: ensure RNG configured before ssl_setup"
  if marker in text:
    return

  setup_snippet = (
    "  mbedtls_ssl_init(&backend->ssl);\n"
    "  if(mbedtls_ssl_setup(&backend->ssl, &backend->config)) {\n"
  )
  rng_block = (
    "  mbedtls_ssl_conf_authmode(&backend->config, MBEDTLS_SSL_VERIFY_OPTIONAL);\n"
    "\n"
    "  mbedtls_ssl_conf_rng(&backend->config, mbedtls_ctr_drbg_random,\n"
    "                       &backend->ctr_drbg);\n"
  )

  if setup_snippet not in text or rng_block not in text:
    raise SystemExit("未找到预期的 mbedtls 代码片段，无法自动打补丁")

  insert_block = (
    "  /* react-native-curl: ensure RNG configured before ssl_setup */\n"
    "  /* react-native-curl: 在 ssl_setup 之前配置 RNG */\n"
    "  mbedtls_ssl_conf_rng(&backend->config, mbedtls_ctr_drbg_random,\n"
    "                       &backend->ctr_drbg);\n"
    "\n"
  )

  text = text.replace(setup_snippet, insert_block + setup_snippet, 1)
  text = text.replace(rng_block, "  mbedtls_ssl_conf_authmode(&backend->config, MBEDTLS_SSL_VERIFY_OPTIONAL);\n\n", 1)

  target.write_text(text)


def main() -> None:
  if len(sys.argv) != 2:
    raise SystemExit("用法: patch_curl_rng.py <curl_source_dir>")
  source_dir = pathlib.Path(sys.argv[1]).resolve()
  apply_patch(source_dir)


if __name__ == "__main__":
  main()
