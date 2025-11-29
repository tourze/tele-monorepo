
use whoami;

#[tauri::command]
pub fn get_current_user() -> Result<String, String> {
    let username = whoami::username();
    Ok(username)
}
