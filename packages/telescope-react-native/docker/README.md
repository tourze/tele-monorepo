Windows 交叉构建（Docker）
================================

本目录提供在 Linux 环境下，通过 Docker 交叉构建 Windows x86_64 安装包的方案。

先决条件
--------------------------------
- 已安装 Docker，并可访问外网（拉取基础镜像、安装依赖）。
- 仓库根目录运行命令（脚本会挂载当前目录）。
- 若网络需代理，脚本会自动透传 `HTTP_PROXY/HTTPS_PROXY/NO_PROXY` 等环境变量。
关于 sidecar（externalBin）
- 本项目已在 `src-tauri` 根目录按 Tauri 约定命名提供不同平台的二进制，例如：
  - `sing-box-x86_64-pc-windows-msvc.exe`
  - `sing-box-aarch64-pc-windows-msvc.exe`
  - `sing-box-*-apple-darwin` 等
- Tauri 会在打包时自动选择匹配目标平台的文件，并放入资源目录并重命名为 `sing-box(.exe)`，无需另行放置到 `bin/` 目录。

一键构建
--------------------------------
在仓库根目录执行：

```bash
bash apps/telescope-react-native/docker/build-windows-x86.sh
```

构建完成后，产物输出在：

- `apps/telescope-react-native/src-tauri/target/x86_64-pc-windows-msvc/release/bundle/`
  - 常见为 `bundle/nsis/*.exe`

自定义构建（可选）
--------------------------------
手动分步执行：

```bash
# 1) 构建基础镜像（包含 Node/Yarn、Rust、clang/lld、nsis、cargo-xwin）
docker build -f apps/telescope-react-native/docker/Dockerfile.win -t telescope-tauri-win:latest .

# 2) 运行构建（挂载当前仓库）
docker run --rm \
  -e HTTP_PROXY -e HTTPS_PROXY -e NO_PROXY -e http_proxy -e https_proxy -e no_proxy \
  -v "$(pwd)":/work -w /work \
  telescope-tauri-win:latest \
  "yarn install || yarn; yarn workspace telescope-react-native build-windows-x86"
```

说明
--------------------------------
- Docker 镜像内已预装：
  - Rust（stable）+ `cargo-xwin`，并预取 Windows msvc 工具链（网络不稳时可减小失败概率）。
  - clang/lld（用于交叉编译 C/C++ 依赖，如 `ring`）。
  - nsis（用于生成 Windows 安装包）。
- 前端打包调用 `yarn web:build`，已在 `tauri.conf.json` 中配置。
- 若需打包 Windows ARM64，可仿照脚本调整目标和工具链（`aarch64-pc-windows-msvc`）。
