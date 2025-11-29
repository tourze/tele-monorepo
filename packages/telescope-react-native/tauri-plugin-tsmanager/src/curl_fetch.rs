use std::time::Duration;
use curl::easy::{Easy, List};
use serde::{Deserialize, Serialize};
use tokio::task;
use tauri::{command};

#[derive(Deserialize)]
struct Header {
    key: String,
    value: String,
}

#[derive(Deserialize)]
pub struct FetchOptions {
    url: String,
    method: Option<String>,
    timeout: Option<u64>,
    headers: Option<Vec<Header>>, // 使用自定义的 Header 结构体
    body: Option<String>,
    connect_to: Option<Vec<String>>,
}

#[derive(Serialize)]
pub struct FetchResponse {
    status: u32,
    //headers: Vec<(String, String)>,
    body: String,
}

#[command]
pub async fn curl_fetch(options: FetchOptions) -> Result<FetchResponse, String> {
    task::spawn_blocking(move || {
        let mut easy = Easy::new();
        easy.url(&options.url).map_err(|e| e.to_string())?;

        if let Some(method) = options.method {
            match method.to_uppercase().as_str() {
                "POST" => {
                    easy.post(true).map_err(|e| e.to_string())?;
                }
                "PUT" => {
                    easy.put(true).map_err(|e| e.to_string())?;
                }
                "DELETE" => {
                    easy.custom_request("DELETE").map_err(|e| e.to_string())?;
                }
                _ => {
                    easy.get(true).map_err(|e| e.to_string())?;
                }
            }
        }

        // 超时时间
        if let Some(timeout) = options.timeout {
            let timeout_duration = Duration::from_secs(timeout);
            easy.timeout(timeout_duration).map_err(|e| e.to_string())?;
        }

        // 设置 --connect-to 用来连接优选IP的
        if let Some(connect_to) = options.connect_to {
            let mut list = List::new();
            for value in connect_to {
                list.append(&format!("{}", value))
                    .map_err(|e| e.to_string())?;
            }
            easy.connect_to(list).map_err(|e| e.to_string())?;
        }

        // 自定义 header
        if let Some(headers) = options.headers {
            let mut list = List::new();
            for header in headers {
                list.append(&format!("{}: {}", header.key, header.value))
                    .map_err(|e| e.to_string())?;
            }
            easy.http_headers(list).map_err(|e| e.to_string())?;
        }

        // Body
        if let Some(body) = options.body {
            easy.post_fields_copy(body.as_bytes())
                .map_err(|e| e.to_string())?;
        }

        let mut response_body = Vec::new();
        {
            let mut transfer = easy.transfer();
            transfer
                .write_function(|data| {
                    response_body.extend_from_slice(data);
                    Ok(data.len())
                })
                .map_err(|e| e.to_string())?;
            transfer.perform().map_err(|e| e.to_string())?;
        }

        let status = easy.response_code().map_err(|e| e.to_string())?;
        let mut headers = Vec::new();
        easy.header_function(move |header| {
            if let Ok(header_str) = String::from_utf8(header.to_vec()) {
                let parts: Vec<&str> = header_str.splitn(2, ':').collect();
                if parts.len() == 2 {
                    headers.push((parts[0].trim().to_string(), parts[1].trim().to_string()));
                }
            }
            true
        })
            .map_err(|e| e.to_string())?;

        Ok(FetchResponse {
            status,
            body: String::from_utf8(response_body).map_err(|e| e.to_string())?,
        })
    }).await.map_err(|e| e.to_string())?
}
