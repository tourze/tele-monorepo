const COMMANDS: &[&str] = &[
  "ping",
  "is_debugger_present",
  "curl_fetch",
  "write_file",
  "read_file_content",
  "export_app_logs",
  "get_current_user",
  "disable_os_proxy",
  "count_processes_by_name",
  "kill_processes_by_name",
  "read_qr_code",
  "is_elevated",
  "run_osascript",
  "run_elevated_command",
];

fn main() {
  tauri_plugin::Builder::new(COMMANDS)
    .android_path("android")
    .ios_path("ios")
    .build();
}
