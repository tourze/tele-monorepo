#!/usr/bin/env bash
set -euo pipefail

# 在 Docker 中交叉编译 Windows x86_64 安装包
# 产物输出：apps/telescope-react-native/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/

IMAGE_TAG="telescope-tauri-win:latest"
# 使用去除了构建期 cargo 安装步骤且稳定的 Dockerfile（win2）
DOCKERFILE="apps/telescope-react-native/docker/Dockerfile.win2"

# 构建基础镜像（包含 Node+Yarn、Rust、clang/lld、nsis、cargo-xwin）
# 透传构建期代理（如有）
is_loopback() {
  case "$1" in
    *127.0.0.1*|*localhost*) return 0;;
    *) return 1;;
  esac
}

BUILD_ARGS=()
if [ -n "${HTTP_PROXY:-}" ] && ! is_loopback "$HTTP_PROXY"; then BUILD_ARGS+=(--build-arg HTTP_PROXY="$HTTP_PROXY"); fi
if [ -n "${HTTPS_PROXY:-}" ] && ! is_loopback "$HTTPS_PROXY"; then BUILD_ARGS+=(--build-arg HTTPS_PROXY="$HTTPS_PROXY"); fi
if [ -n "${NO_PROXY:-}" ]; then BUILD_ARGS+=(--build-arg NO_PROXY="$NO_PROXY"); fi
if [ -n "${http_proxy:-}" ] && ! is_loopback "$http_proxy"; then BUILD_ARGS+=(--build-arg http_proxy="$http_proxy"); fi
if [ -n "${https_proxy:-}" ] && ! is_loopback "$https_proxy"; then BUILD_ARGS+=(--build-arg https_proxy="$https_proxy"); fi
if [ -n "${no_proxy:-}" ]; then BUILD_ARGS+=(--build-arg no_proxy="$no_proxy"); fi

# 在本机构建期使用 host 网络，便于访问本地代理（如 127.0.0.1:7890）
docker build --network=host -f "$DOCKERFILE" -t "$IMAGE_TAG" "${BUILD_ARGS[@]}" .

# 将当前仓库挂载到 /work，容器内执行依赖安装与打包
# 透传代理环境变量（如需）
RUN_ENVS=()
# 仅在代理不是回环地址时才透传到容器，避免容器内访问 127.0.0.1 失败
if [ -n "${HTTP_PROXY:-}" ] && ! is_loopback "$HTTP_PROXY"; then RUN_ENVS+=( -e HTTP_PROXY ); fi
if [ -n "${HTTPS_PROXY:-}" ] && ! is_loopback "$HTTPS_PROXY"; then RUN_ENVS+=( -e HTTPS_PROXY ); fi
if [ -n "${NO_PROXY:-}" ]; then RUN_ENVS+=( -e NO_PROXY ); fi
if [ -n "${http_proxy:-}" ] && ! is_loopback "$http_proxy"; then RUN_ENVS+=( -e http_proxy ); fi
if [ -n "${https_proxy:-}" ] && ! is_loopback "$https_proxy"; then RUN_ENVS+=( -e https_proxy ); fi
if [ -n "${no_proxy:-}" ]; then RUN_ENVS+=( -e no_proxy ); fi

# 以当前宿主用户身份运行，避免在挂载目录生成 root 文件
HOST_UID=$(id -u)
HOST_GID=$(id -g)

docker run --rm --network=host \
  --user ${HOST_UID}:${HOST_GID} \
  --entrypoint /bin/bash \
  "${RUN_ENVS[@]}" \
  -e HOME=/work \
  -e CARGO_HOME=/work/.cargo \
  -e SCCACHE_DIR=/work/.cache/sccache \
  -e NPM_CONFIG_PREFIX=/work/.npm-global \
  -e npm_config_cache=/work/.npm \
  -v "$(pwd)":/work -w /work \
  "$IMAGE_TAG" \
  -lc "set -e; \
  # 将 Cargo 安装与缓存放置到挂载目录，保证可写且避免 root 文件 \
  export HOME=/work; \
  export CARGO_HOME=/work/.cargo SCCACHE_DIR=/work/.cache/sccache; \
  mkdir -p /work/.npm /work/.npm-global/bin; \
  npm config set prefix /work/.npm-global >/dev/null 2>&1 || true; \
  npm config set cache /work/.npm >/dev/null 2>&1 || true; \
  export PATH=\"/work/.npm-global/bin:/usr/local/cargo/bin:/usr/local/rustup/bin:$CARGO_HOME/bin:$PATH\"; \
  cargo --version || true; \
  # 配置 Rust/Cargo 镜像，加速 crates 下载 \
  export RUSTUP_DIST_SERVER=\"https://rsproxy.cn\" RUSTUP_UPDATE_ROOT=\"https://rsproxy.cn/rustup\" CARGO_HTTP_MULTIPLEXING=\"false\"; \
  mkdir -p \"$CARGO_HOME\"; \
  cat > \"$CARGO_HOME/config.toml\" <<'EOF'; \
[source.crates-io] \
replace-with = 'rsproxy-sparse' \
 \
[source.rsproxy] \
registry = 'https://github.com/rust-lang/crates.io-index' \
 \
[source.rsproxy-sparse] \
registry = 'sparse+https://rsproxy.cn/index/' \
 \
[net] \
git-fetch-with-cli = true \
retry = 3 \
EOF \
  cargo install tauri-cli --locked --version ^2 || cargo install tauri-cli --locked || true; \
  cargo install cargo-xwin; \
  cargo xwin --accept-license tools --targets x86_64 || true; \
  echo '--- cargo bin list ---'; ls -l \"$CARGO_HOME/bin\" || true; \
  echo '--- cargo subcommands ---'; cargo --list | sed -n '1,200p' || true; \
  # 安装前在容器内禁用代理，避免 sharp 通过 127.0.0.1 代理下载失败；并切换 sharp 的 libvips 镜像
  unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy ALL_PROXY all_proxy || true; \
  export SHARP_DIST_BASE_URL=\"https://npmmirror.com/mirrors/sharp-libvips\"; \
  export npm_config_sharp_dist_base_url=\"https://npmmirror.com/mirrors/sharp-libvips\"; \
  yarn install --ignore-scripts=false || npm i --legacy-peer-deps --no-audit --no-fund; \
  yarn workspace telescope-react-native web:build; \
  # 安装 tauri 子命令可能未暴露为 `cargo tauri`，改用 `tauri build` 直接调用
  cd apps/telescope-react-native; \
  export PATH=\"/usr/local/cargo/bin:/usr/local/rustup/bin:$CARGO_HOME/bin:$PATH\"; \
  echo '使用 cargo-xwin 构建 Windows 目标（无需 rustup target）'; \
  echo '使用本地 node_modules 的 Tauri CLI 构建'; \
  export TAURI_SKIP_BUILD=true; \
  export RC=x86_64-w64-mingw32-windres; \
  export PATH=\"/bin:/usr/bin:/usr/local/bin:/usr/local/cargo/bin:/usr/local/rustup/bin:$CARGO_HOME/bin:$PATH\"; \
  if [ -f "./node_modules/@tauri-apps/cli/tauri.js" ]; then \
    CC_x86_64_pc_windows_msvc=clang CXX_x86_64_pc_windows_msvc=clang++ /usr/local/bin/node ./node_modules/@tauri-apps/cli/tauri.js build --target x86_64-pc-windows-msvc --runner cargo-xwin; \
  elif [ -f "../../node_modules/@tauri-apps/cli/tauri.js" ]; then \
    CC_x86_64_pc_windows_msvc=clang CXX_x86_64_pc_windows_msvc=clang++ /usr/local/bin/node ../../node_modules/@tauri-apps/cli/tauri.js build --target x86_64-pc-windows-msvc --runner cargo-xwin; \
  elif command -v tauri >/dev/null 2>&1; then \
    CC_x86_64_pc_windows_msvc=clang CXX_x86_64_pc_windows_msvc=clang++ tauri build --target x86_64-pc-windows-msvc --runner cargo-xwin; \
  else \
    echo 'error: 未找到 tauri CLI (本地或全局)。请确认已安装 @tauri-apps/cli。'; \
    exit 127; \
  fi"

echo "\n构建完成。如无报错，安装包位于："
echo "  apps/telescope-react-native/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/"

echo "\n说明：项目已在 \"src-tauri\" 根目录按 Tauri 约定提供不同平台的 sing-box 可执行文件（如 sing-box-x86_64-pc-windows-msvc.exe）。\nTauri 会在打包时自动选择并重命名为资源目录内的 \"sing-box(.exe)\"，无需手动放置到 bin/ 目录。"
