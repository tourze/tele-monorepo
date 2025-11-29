#[tauri::command]
pub fn run_elevated_command(command: String, args: Vec<String>) -> Result<String, String> {
    use elevated_command::{Command};
    use std::process::Command as StdCommand;

    let is_elevated = Command::is_elevated();

    let mut cmd = StdCommand::new(command);
    cmd.args(args);

    let output = if is_elevated {
        cmd.output().unwrap()
    } else {
        let elevated_cmd = Command::new(cmd);
        elevated_cmd.output().unwrap()
    };

    if output.status.success() {
        // 如果命令执行成功，返回 stdout 的内容
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        // 如果命令执行失败，返回 stderr 的内容
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
