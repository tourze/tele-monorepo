use std::fs;

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    // 尝试将内容写入文件
    match fs::write(path, content) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file: {}", e)),
    }
}
