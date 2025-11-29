use tauri::{
  plugin::{Builder, TauriPlugin},
  Manager, Runtime,
};

pub use models::*;

#[cfg(desktop)]
mod desktop;
#[cfg(mobile)]
mod mobile;

mod commands;
mod error;
mod models;
mod is_debugger_present;
mod curl_fetch;
mod write_file;
mod export_app_logs;
mod disable_os_proxy;
mod count_processes_by_name;
mod kill_processes_by_name;
mod read_qr_code;
mod is_elevated;
mod get_current_user;
mod read_file_content;
mod run_osascript;
mod run_elevated_command;

pub use error::{Error, Result};

#[cfg(desktop)]
use desktop::Ttmanager;
#[cfg(mobile)]
use mobile::Ttmanager;

/// Extensions to [`tauri::App`], [`tauri::AppHandle`] and [`tauri::Window`] to access the tsmanager APIs.
pub trait TtmanagerExt<R: Runtime> {
  fn tsmanager(&self) -> &Ttmanager<R>;
}

impl<R: Runtime, T: Manager<R>> crate::TtmanagerExt<R> for T {
  fn tsmanager(&self) -> &Ttmanager<R> {
    self.state::<Ttmanager<R>>().inner()
  }
}

/// Initializes the plugin.
pub fn init<R: Runtime>() -> TauriPlugin<R> {
  Builder::new("tsmanager")
    .invoke_handler(tauri::generate_handler![
        commands::ping,
        is_debugger_present::is_debugger_present,
        curl_fetch::curl_fetch,
        write_file::write_file,
        read_file_content::read_file_content,
        export_app_logs::export_app_logs,
        get_current_user::get_current_user,
        disable_os_proxy::disable_os_proxy,
        count_processes_by_name::count_processes_by_name,
        kill_processes_by_name::kill_processes_by_name,
        read_qr_code::read_qr_code,
        is_elevated::is_elevated,
        run_osascript::run_osascript,
        run_elevated_command::run_elevated_command,
    ])
    .setup(|app, api| {
      #[cfg(mobile)]
      let tsmanager = mobile::init(app, api)?;
      #[cfg(desktop)]
      let tsmanager = desktop::init(app, api)?;
      app.manage(tsmanager);
      Ok(())
    })
    .build()
}
