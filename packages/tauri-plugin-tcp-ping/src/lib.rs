use tauri::plugin::{Builder, TauriPlugin};
use tauri::Runtime;

mod batch;
mod tcping;

pub use tcping::tcping;

/// 初始化 TCP Ping 插件，向 Tauri 注册 `tcping`/`start_batch_ping`/`stop_batch_ping` 命令
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("tcp-ping")
    .invoke_handler(tauri::generate_handler![
      tcping::tcping,
      batch::start_batch_ping,
      batch::stop_batch_ping,
    ])
    .build()
}
