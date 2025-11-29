use serde::Deserialize;
use std::net::ToSocketAddrs;
use std::time::{Duration, Instant};
use tokio::net::TcpStream;
use tokio::time::timeout;

const DEFAULT_COUNT: u32 = 4;
const DEFAULT_TIMEOUT_MS: u64 = 3_000;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TcpPingArgs {
    pub host: String,
    pub port: u16,
    #[serde(default)]
    pub count: Option<u32>,
    #[serde(default)]
    pub timeout_ms: Option<u64>,
}

/// 执行 TCP Ping 并返回平均耗时（毫秒）
#[tauri::command]
pub async fn tcping(args: TcpPingArgs) -> Result<f64, String> {
    let count = normalize_count(args.count);
    let timeout_ms = normalize_timeout(args.timeout_ms);
    run_tcp_ping(&args.host, args.port, count, timeout_ms).await
}

pub fn normalize_count(value: Option<u32>) -> u32 {
    value.unwrap_or(DEFAULT_COUNT).max(1)
}

pub fn normalize_timeout(value: Option<u64>) -> u64 {
    value.unwrap_or(DEFAULT_TIMEOUT_MS).clamp(100, 60_000)
}

pub async fn run_tcp_ping(host: &str, port: u16, count: u32, timeout_ms: u64) -> Result<f64, String> {
    let mut total_duration = 0u128;
    let mut success_count = 0u32;
    let timeout_duration = Duration::from_millis(timeout_ms);

    for _ in 0..count {
        let addrs = format!("{}:{}", host, port)
            .to_socket_addrs()
            .map_err(|e| format!("解析地址错误: {}", e))?;

        let start = Instant::now();
        let mut connected = false;

        for addr in addrs {
            match timeout(timeout_duration, TcpStream::connect(addr)).await {
                Ok(Ok(_)) => {
                    let duration = start.elapsed();
                    total_duration += duration.as_millis();
                    success_count += 1;
                    connected = true;
                    break;
                }
                Ok(Err(e)) => {
                    if e.kind() == tokio::io::ErrorKind::TimedOut {
                        continue;
                    } else {
                        return Err(format!("连接到 {} 时出错: {}", addr, e));
                    }
                }
                Err(_) => {
                    continue;
                }
            }
        }

        if !connected {
            continue;
        }
    }

    if success_count == 0 {
        return Err("无法连接到指定的主机/端口".into());
    }

    Ok(total_duration as f64 / success_count as f64)
}
