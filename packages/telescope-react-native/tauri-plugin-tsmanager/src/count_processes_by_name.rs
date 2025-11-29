use sysinfo::{System, SystemExt};
use tokio::task;

// 查询符合条件的进程数量
#[tauri::command]
pub async fn count_processes_by_name(process_name: String) -> Result<usize, String> {
    let count = task::spawn_blocking(move || {
        let mut system = System::new_all();
        system.refresh_all();
        system.processes_by_name(&process_name).count()
    }).await.map_err(|e| e.to_string())?;

    Ok(count)
}
