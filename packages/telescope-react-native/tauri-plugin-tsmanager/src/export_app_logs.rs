use std::io::{Read, Write};
use zip::write::FileOptions;
use zip::ZipWriter;
use zip::CompressionMethod;
use std::fs::File;
use std::io::BufWriter;

#[tauri::command]
pub fn export_app_logs(file_patterns: Vec<String>, file_name: String) -> Result<(), String> {
    // Create a path to store the ZIP file
    let desktop_dir = match dirs::desktop_dir() {
        Some(path) => path,
        None => return Err("Unable to find desktop path".to_string()),
    };
    let zip_file_path = desktop_dir.join(&file_name);

    // Create ZIP file
    let zip_file = match File::create(&zip_file_path) {
        Ok(file) => file,
        Err(e) => return Err(format!("Failed to create ZIP file: {}", e)),
    };
    let mut zip = ZipWriter::new(BufWriter::new(zip_file));

    let options = FileOptions::default()
        .compression_method(CompressionMethod::Deflated)
        .unix_permissions(0o755);

    for pattern in &file_patterns {
        let paths = glob::glob(pattern).map_err(|e| format!("Failed to search files: {}", e))?;
        for entry in paths {
            match entry {
                Ok(path) => {
                    if path.is_file() {
                        let mut file = File::open(&path).map_err(|e| format!("Unable to open file: {}", e))?;
                        let mut buffer = Vec::new();
                        file.read_to_end(&mut buffer).map_err(|e| format!("Failed to read file: {}", e))?;

                        let file_name = path.file_name()
                            .ok_or_else(|| "Unable to get file name".to_string())?
                            .to_string_lossy()
                            .into_owned();

                        // Write to ZIP
                        zip.start_file(file_name, options).map_err(|e| format!("Failed to write to ZIP: {}", e))?;
                        zip.write_all(&buffer).map_err(|e| format!("Failed to write to ZIP: {}", e))?;
                    }
                }
                Err(e) => {
                    return Err(format!("Path matching failed: {}", e));
                }
            }
        }
    }

    zip.finish().map_err(|e| format!("Failed to close ZIP: {}", e))?;

    Ok(())
}
