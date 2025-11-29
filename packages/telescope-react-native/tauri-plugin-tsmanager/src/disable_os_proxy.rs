
static MACOS_DISABLE_WIFI: &str = "networksetup -setwebproxystate Wi-Fi off && networksetup -setsecurewebproxystate Wi-Fi off";

static MACOS_DISABLE_NET: &str = "networksetup -setwebproxystate Ethernet off && networksetup -setsecurewebproxystate Ethernet off";

#[tauri::command]
pub fn disable_os_proxy() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    fn disable_proxy() -> Result<(), String> {
        use std::process::Command;
        use std::os::windows::process::CommandExt;

        const CREATE_NO_WINDOW: u32 = 0x08000000;

        // 使用 netsh 清除 Windows 的代理设置
        Command::new("cmd")
            .args(&["/C", "netsh", "winhttp", "reset", "proxy"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output()
            .expect("Failed to clear proxy settings");

        let output = Command::new("powershell")
            .args(&["-Command", "Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings' -Name ProxyEnable -Value 0"])
            .creation_flags(CREATE_NO_WINDOW) // 隐藏窗口
            .output();

        match output {
            Ok(output) => {
                if output.status.success() {
                    Ok(())
                } else {
                    Err(format!(
                        "Failed to disable proxy: {}",
                        String::from_utf8_lossy(&output.stderr)
                    ))
                }
            }
            Err(e) => Err(format!("Failed to execute command: {}", e)),
        }
    }

    #[cfg(target_os = "macos")]
    fn disable_proxy() -> Result<(), String> {
        use std::process::Command;

        // Try disabling proxy for Wi-Fi
        let wifi_output = Command::new("sh")
            .arg("-c")
            .arg(MACOS_DISABLE_WIFI.to_string())
            .output();

        if let Ok(output) = wifi_output {
            if output.status.success() {
                return Ok(());
            }
        }

        // If Wi-Fi command failed, try disabling proxy for Ethernet
        let ethernet_output = Command::new("sh")
            .arg("-c")
            .arg(MACOS_DISABLE_NET.to_string())
            .output();

        match ethernet_output {
            Ok(output) => {
                if output.status.success() {
                    Ok(())
                } else {
                    Err(format!(
                        "Failed to disable proxy for Ethernet: {}",
                        String::from_utf8_lossy(&output.stderr)
                    ))
                }
            }
            Err(e) => Err(format!("Failed to execute command: {}", e)),
        }
    }

    #[cfg(target_os = "linux")]
    fn disable_proxy() -> Result<(), String> {
        use std::process::Command;
        let output = Command::new("sh")
            .arg("-c")
            .arg("gsettings set org.gnome.system.proxy mode 'none'")
            .output();

        match output {
            Ok(output) => {
                if output.status.success() {
                    Ok(())
                } else {
                    Err(format!(
                        "Failed to disable proxy: {}",
                        String::from_utf8_lossy(&output.stderr)
                    ))
                }
            }
            Err(e) => Err(format!("Failed to execute command: {}", e)),
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    fn disable_proxy() -> Result<(), String> {
        Err("Unsupported platform".into())
    }

    match disable_proxy() {
        Ok(_) => Ok("Proxy disabled successfully".into()),
        Err(e) => Err(e),
    }
}
