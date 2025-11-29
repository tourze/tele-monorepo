use sysinfo::{ProcessExt, System, SystemExt};
use tokio::task;

#[tauri::command]
pub async fn kill_processes_by_name(process_name: String) -> Result<usize, String> {
    let killed_count = task::spawn_blocking(move || {
        let mut system = System::new_all();
        system.refresh_all();
        let mut killed_count = 0;

        for process in system.processes_by_name(&process_name) {
            if process.kill() {
                killed_count += 1;
            } else {
                return Err(format!("Failed to kill process with PID: {}", process.pid()));
            }
        }

        Ok(killed_count)
    }).await.map_err(|e| e.to_string())??;

    Ok(killed_count)
}
