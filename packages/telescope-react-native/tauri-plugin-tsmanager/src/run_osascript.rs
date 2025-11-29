#[cfg(target_os = "macos")]
#[tauri::command]
pub async fn run_osascript(script: String) -> Result<(), String> {
    let output = std::process::Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(format!("Script failed: {}", String::from_utf8_lossy(&output.stderr)));
    }

    Ok(())
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub async fn run_osascript(script: String) -> Result<(), String> {
    Ok(())
}
