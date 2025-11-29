# SSR 代理链路排查报告（Android + Docker/Clash）

## 1. 当前 Android 端链路状态
- `react-native-shadowsocksr` 库已恢复/实现：
  - `ss-local` 启动参数含 `-V/-v/-x`，socket 在建立前会调用 `VpnService.protect()`。
  - JS -> 原生所有 profile 字段（DNS、UDP、LAN、包名白名单、强制代理域名等）均透传；ACL 可按需追加 `forceProxyHosts`。
  - `ShadowsocksVpnThread` 日志可见大量 `protect fd xxx success`，`tun0`、`libss-local.so`、`libtun2socks.so`、`libpdnsd.so` 均常驻。
- 即便如此，`adb forward` 后执行 `curl --socks5 127.0.0.1:1080 …` 仍然 15 s 超时；`shadowsocks` 日志只打印 `connect to … via 183.*:35***`，没有任何成功/失败回包，`MainActivity trafficUpdated` 的 tx/rx 统计维持 0，说明远端未返回有效数据。

## 2. 节点可用性交叉验证
| 节点 | 客户端 | 结果 |
|------|--------|------|
| 183.2.133.26:35240 | Docker `breakwa11/shadowsocksr` | `curl` 立即 `Recv failure: Connection reset by peer` |
| tmp-001.telescopes.work:35001 | Docker `breakwa11/shadowsocksr` | 同上，立即被 RST |
| 183.236.51.117:35001 | Docker `breakwa11/shadowsocksr` | 同上，立即被 RST |
| 183.2.133.26:35240 | mihomo(clash) 代理 | `curl` `TLS connect error: unexpected EOF` |
| 183.236.51.117:35001 | mihomo(clash) 代理 | 同上 |

> 说明：上述所有测试均使用相同参数（`cipher=aes-256-cfb`、`protocol=auth_aes128_md5`、`obfs=tls1.2_ticket_auth`、`password=hGkQ6915tD`、`obfs_param=ajax.microsoft.com`，无 protocol_param）。无论换节点或客户端，握手后都会被服务器主动断开/复位，未见任何成功流量。

## 3. 结论
1. Android 客户端实现已经满足 VPN 保护、ACL、DNS、包名白名单等需求；代理链路失败并非源于代码逻辑。
2. 提供的三个 SSR 节点（`183.2.133.26:35240`、`tmp-001.telescopes.work:35001`、`183.236.51.117:35001`）在标准 SSR 客户端（Docker 版、mihomo/clash）环境下同样无法正常通信，表现为远端复位或 TLS 握手直接 EOF。
3. 推测原因：服务端限制了 `protocol_param`/用户白名单、节点已停服、或有额外认证策略。需要联系节点维护方确认正确配置，或提供一个已验证可用的节点以继续调试。

## 4. 复现步骤（以 mihomo 为例）
1. 写入 `/tmp/mihomo-ssr.yaml`：
```yaml
port: 40000
socks-port: 40001
allow-lan: true
mode: rule
log-level: info
proxies:
  - name: ssr-test
    type: ssr
    server: 183.236.51.117
    port: 35001
    cipher: aes-256-cfb
    password: hGkQ6915tD
    protocol: auth_aes128_md5
    protocol-param: ""
    obfs: tls1.2_ticket_auth
    obfs-param: ajax.microsoft.com
    udp: true
proxy-groups:
  - name: auto
    type: select
    proxies: [ssr-test]
rules:
  - MATCH,auto
```
2. 启动：`mihomo -f /tmp/mihomo-ssr.yaml`。
3. 在宿主执行 `curl --socks5-hostname 127.0.0.1:40001 https://api.ip.sb/ip`。
4. 观察报错 `curl: (35) TLS connect error: unexpected eof while reading`，日志显示 `[TCP] … --> api.ip.sb:443 match …`。
5. 使用其他节点，只需调整 `server`/`port` 即可复现。

## 5. Android 实际注入的 SSR 配置示例
以下内容直接来自设备 `adb shell "run-as com.telescope.pro cat ss-local-vpn.conf"`，为真实注入 `ss-local` 的 JSON：
```json
{"server": "183.2.133.26", "server_port": 35240, "local_port": 1080, "password": "hGkQ6915tD", "user_id": 0, "user_pass": "", "method":"aes-256-cfb", "timeout": 600, "protocol": "auth_aes128_md5", "obfs": "tls1.2_ticket_auth", "obfs_param": "ajax.microsoft.com", "protocol_param": ""}
```
其他运行期参数：
- `route`: 默认 `default-server`，若用户选择全局则改为 `all`。
- `lanOpen`: 来自存储 `lanOpen` 开关，影响 `ss-local` 绑定地址和 mihomo 是否允许局域网访问。
- `udpRelay`: 对应 `udpdns`，用于控制 `ss-local` 是否带 `-U`。
- `customTunAddresses` / `customTunRoutes`: 映射为 `SSRProfile.tunAddresses/tunRoutes`，Android 端会在 `VpnService.Builder` 中追加路由或地址。
- `vpnBypassPackages`: JS 层生成 `disallowedApps`，原生 `ShadowsocksVpnService` 将其写入 `builder.addDisallowedApplication()`；若为空则默认 `com.telescope.pro`。
- `vpnForceProxyHosts`: 可配置域名列表，原生在 `default-server.acl` 前插入 `[proxy_list]` 片段生成 `custom-*.acl`。
- DNS：若 JS 未显式配置，Android 端会在解析失败时回退至 `119.29.29.29`（国内）和 `223.5.5.5`。

综上，Android 实际运行的 SSR 配置与 Docker/mihomo 测试使用的参数完全一致（包括密码、method、protocol、obfs、obfs_param 等），再次印证“节点本身拒绝连接”这一结论。

## 6. Docker 一键化 SSR 服务端与客户端验证
为避免额外编写配置文件，可直接透传命令行参数到官方 `breakwa11/shadowsocksr` 镜像，实现服务端启动与客户端验证，容器退出即自动删除。

### 6.1 服务端快速启动
```
docker run --rm -it \
  --name telescope-ssr \
  -p 35240:35240 \
  breakwa11/shadowsocksr \
  python server.py \
    -s 0.0.0.0 \
    -p 35240 \
    -k hGkQ6915tD \
    -m aes-256-cfb \
    -O auth_aes128_md5 \
    -o tls1.2_ticket_auth \
    -g ajax.microsoft.com \
    -G "" \
    -t 600 \
    -v
```
- 去掉 `-d`，运行后即可实时看到 `server.py` 输出，按 `Ctrl+C` 或在另一个终端执行 `docker stop telescope-ssr` 即停止并自动删除容器。
- `--rm` 依旧确保退出即清理；`-p` 将宿主 35240 暴露给外部，参数与第 2、5 节保持一致，更换节点只需替换 `-p/-k/-m/-O/-o/-g/-G`；`-v` 或 `-vv` 可开启更详细日志，便于观察握手过程。
- 若需后台运行与日志跟随，可在另一个终端使用 `docker logs -f telescope-ssr`，或自行恢复 `-d`。

### 6.2 客户端（Socks5）验证
服务端容器就绪后，可再启动一个客户端容器，通过 `local.py` 暴露本地 `Socks5` 端口并配合 `curl` 验证链路：
```
docker run --rm \
  --name telescope-ssr-client \
  --network host \
  breakwa11/shadowsocksr \
  python local.py \
    -s 127.0.0.1 \
    -p 35240 \
    -k hGkQ6915tD \
    -m aes-256-cfb \
    -O auth_aes128_md5 \
    -o tls1.2_ticket_auth \
    -g ajax.microsoft.com \
    -G "" \
    -l 40000 \
    -b 127.0.0.1 \
    -v
```
- `--network host` 让客户端容器共享宿主网络，`local.py` 监听的 `40000` 直接暴露到宿主；如需访问远程节点，可改 `-s` 为实际服务器 IP 并移除 `--network host`。
- 客户端也追加 `-v`（或 `-vv`）以输出握手/转发细节；验证命令示例：`curl --socks5-hostname 127.0.0.1:40000 https://api.ip.sb/ip` ；日志可用 `docker logs -f telescope-ssr-client` 查看。
- 停止验证：`docker stop telescope-ssr-client`，因 `--rm` 已启用，停止即清理容器。

通过上述两个命令即可在同一台机器上完成 SSR 服务端与客户端的自洽验收，全流程不依赖额外配置文件，方便复现与调试。
