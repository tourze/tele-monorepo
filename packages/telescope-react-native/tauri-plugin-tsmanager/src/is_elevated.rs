
#[tauri::command]
pub fn is_elevated() -> bool {
    // 针对 Windows 系统进行管理员权限检测
    #[cfg(target_os = "windows")]
    {
        use winapi::um::processthreadsapi::OpenProcessToken;
        use winapi::um::securitybaseapi::GetTokenInformation;
        use winapi::um::winnt::{TokenElevation, HANDLE, TOKEN_ELEVATION};
        use winapi::um::handleapi::CloseHandle;
        use winapi::um::processthreadsapi::GetCurrentProcess;
        use std::ptr;

        unsafe {
            let mut token: HANDLE = ptr::null_mut();
            if OpenProcessToken(GetCurrentProcess(), 0x0008, &mut token) == 0 {
                return false;
            }

            let mut elevation = TOKEN_ELEVATION { TokenIsElevated: 0 };
            let mut return_length = 0;
            if GetTokenInformation(
                token,
                TokenElevation,
                &mut elevation as *mut _ as *mut _,
                std::mem::size_of::<TOKEN_ELEVATION>() as u32,
                &mut return_length,
            ) == 0
            {
                CloseHandle(token);
                return false;
            }

            CloseHandle(token);
            return elevation.TokenIsElevated != 0;
        }
    }

    // 对于非 Windows 系统，返回 false 或其他默认行为
    #[cfg(not(target_os = "windows"))]
    {
        println!("This function is only available on Windows.");
        true
    }
}
