extern crate libc;

use tauri::command;

#[cfg(target_os = "windows")]
#[command]
pub fn is_debugger_present() -> bool {
    extern "system" {
        fn IsDebuggerPresent() -> i32;
    }

    unsafe { IsDebuggerPresent() != 0 }
}

#[cfg(target_os = "macos")]
#[command]
pub fn is_debugger_present() -> bool {
    #[repr(C)]
    struct KinfoProc {
        pub kp_proc: ExternProc,
    }

    #[repr(C)]
    struct ExternProc {
        pub p_flag: i32,
        // Other fields are omitted for brevity
    }

    const CTL_KERN: libc::c_int = 1;
    const KERN_PROC: libc::c_int = 14;
    const KERN_PROC_PID: libc::c_int = 1;
    const P_TRACED: i32 = 0x00000800;

    let mut info = KinfoProc {
        kp_proc: ExternProc {
            p_flag: 0,
        },
    };
    let mut mib = [CTL_KERN, KERN_PROC, KERN_PROC_PID, std::process::id() as libc::c_int];
    let mut size = std::mem::size_of::<KinfoProc>();
    unsafe {
        libc::sysctl(
            mib.as_mut_ptr(),
            mib.len() as u32,
            &mut info as *mut _ as *mut libc::c_void,
            &mut size,
            std::ptr::null_mut(),
            0,
        );
    }
    (info.kp_proc.p_flag & P_TRACED) != 0
}

#[cfg(target_os = "linux")]
#[command]
pub fn is_debugger_present() -> bool {
    let status_path = format!("/proc/{}/status", std::process::id());
    if let Ok(status) = std::fs::read_to_string(status_path) {
        status.contains("TracerPid:\t0")
    } else {
        false
    }
}

#[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
#[command]
pub fn is_debugger_present() -> bool {
    false // Unsupported platform
}
