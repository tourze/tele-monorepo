use crate::tcping::{normalize_count, normalize_timeout, run_tcp_ping};
use dashmap::DashMap;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager};

const EVENT_BATCH_RESULT: &str = "TcpPingBatchResult";

static TASKS: Lazy<DashMap<String, Arc<AtomicBool>>> = Lazy::new(DashMap::new);
static REQUEST_COUNTER: AtomicU64 = AtomicU64::new(0);

#[derive(Debug, Deserialize, Clone)]
#[serde(rename_all = "camelCase", default)]
pub struct BatchPingTarget {
    pub host: Option<String>,
    pub ip: Option<String>,
    pub port: Option<u16>,
    pub count: Option<u32>,
    pub timeout_ms: Option<u64>,
    pub bypass_vpn: Option<bool>,
}

impl Default for BatchPingTarget {
    fn default() -> Self {
        Self {
            host: None,
            ip: None,
            port: None,
            count: None,
            timeout_ms: None,
            bypass_vpn: None,
        }
    }
}

#[derive(Debug, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct BatchPingOptions {
    pub count: Option<u32>,
    pub timeout_ms: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartBatchPingPayload {
    #[serde(default)]
    pub request_id: Option<String>,
    pub targets: Vec<BatchPingTarget>,
    #[serde(default)]
    pub options: Option<BatchPingOptions>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StopBatchPingPayload {
    pub request_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct BatchPingEvent {
    request_id: String,
    host: Option<String>,
    port: Option<u16>,
    total_count: u32,
    success_count: u32,
    avg_time: Option<f64>,
    success: bool,
    done: bool,
    cancelled: bool,
    error: Option<String>,
}

fn generate_request_id() -> String {
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);
    let counter = REQUEST_COUNTER.fetch_add(1, Ordering::Relaxed);
    format!("tcp-{ts}-{counter}")
}

#[tauri::command]
pub async fn start_batch_ping(app: AppHandle, payload: StartBatchPingPayload) -> Result<String, String> {
    if payload.targets.is_empty() {
        return Err("targets 不能为空".into());
    }

    let request_id = payload
        .request_id
        .filter(|id| !id.trim().is_empty())
        .unwrap_or_else(generate_request_id);

    if TASKS.contains_key(&request_id) {
        return Err("requestId 已存在，无法重复启动".into());
    }

    let cancel_flag = Arc::new(AtomicBool::new(false));
    TASKS.insert(request_id.clone(), cancel_flag.clone());

    let options = payload.options.unwrap_or_default();
    let targets = payload.targets.clone();
    let app_handle = app.clone();

    tauri::async_runtime::spawn(async move {
        process_batch(app_handle, request_id.clone(), targets, options, cancel_flag).await;
        TASKS.remove(&request_id);
    });

    Ok(request_id)
}

#[tauri::command]
pub async fn stop_batch_ping(payload: StopBatchPingPayload) -> Result<(), String> {
    if let Some(entry) = TASKS.get(&payload.request_id) {
        entry.value().store(true, Ordering::Relaxed);
    }
    Ok(())
}

async fn process_batch(
    app: AppHandle,
    request_id: String,
    targets: Vec<BatchPingTarget>,
    options: BatchPingOptions,
    cancel_flag: Arc<AtomicBool>,
) {
    let mut processed: u32 = 0;
    let mut success_targets: u32 = 0;
    let mut had_error = false;

    for target in targets {
        if cancel_flag.load(Ordering::Relaxed) {
            break;
        }
        processed = processed.saturating_add(1);

        let host = target.host.clone().filter(|v| !v.is_empty()).or_else(|| {
            target
                .ip
                .clone()
                .filter(|v| !v.is_empty())
        });
        let port = target.port;
        let count = normalize_count(target.count.or(options.count));
        let timeout_ms = normalize_timeout(target.timeout_ms.or(options.timeout_ms));

        if host.is_none() || port.is_none() {
            had_error = true;
            emit_event(
                &app,
                BatchPingEvent {
                    request_id: request_id.clone(),
                    host,
                    port,
                    total_count: count,
                    success_count: 0,
                    avg_time: None,
                    success: false,
                    done: false,
                    cancelled: cancel_flag.load(Ordering::Relaxed),
                    error: Some("目标 host 或 port 无效".into()),
                },
            );
            continue;
        }

        match run_tcp_ping(host.as_ref().unwrap(), port.unwrap(), count, timeout_ms).await {
            Ok(avg_time) => {
                success_targets = success_targets.saturating_add(1);
                emit_event(
                    &app,
                    BatchPingEvent {
                        request_id: request_id.clone(),
                        host: host.clone(),
                        port,
                        total_count: count,
                        success_count: count,
                        avg_time: Some(avg_time),
                        success: true,
                        done: false,
                        cancelled: cancel_flag.load(Ordering::Relaxed),
                        error: None,
                    },
                );
            }
            Err(err) => {
                had_error = true;
                emit_event(
                    &app,
                    BatchPingEvent {
                        request_id: request_id.clone(),
                        host: host.clone(),
                        port,
                        total_count: count,
                        success_count: 0,
                        avg_time: None,
                        success: false,
                        done: false,
                        cancelled: cancel_flag.load(Ordering::Relaxed),
                        error: Some(err),
                    },
                );
            }
        }
    }

    let cancelled = cancel_flag.load(Ordering::Relaxed);
    emit_event(
        &app,
        BatchPingEvent {
            request_id,
            host: None,
            port: None,
            total_count: processed,
            success_count: success_targets,
            avg_time: None,
            success: !had_error && !cancelled,
            done: true,
            cancelled,
            error: None,
        },
    );
}

fn emit_event(app: &AppHandle, event: BatchPingEvent) {
    if let Err(err) = app.emit_all(EVENT_BATCH_RESULT, event) {
        #[cfg(debug_assertions)]
        eprintln!("[tauri-plugin-tcp-ping] 发送事件失败: {err}");
    }
}
