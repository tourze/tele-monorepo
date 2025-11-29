use std::path::Path;
use tokio::task;

#[tauri::command]
pub async fn read_qr_code(image_path: String) -> Result<String, String> {
    let result = task::spawn_blocking(move || {
        let path = Path::new(&image_path);
        if !path.exists() {
            return Err("File does not exist".into());
        }

        // Open and decode the image file
        let img = match image::open(&image_path) {
            Ok(img) => img,
            Err(err) => return Err(format!("Failed to open image: {}", err)),
        };

        let gray_image = img.to_rgba8();

        // Use default decoder
        let decoder = bardecoder::default_decoder();

        let results = decoder.decode(&gray_image);
        for result in results {
            match result {
                Ok(content) => return Ok(content),
                Err(e) => return Err(e.to_string()),
            }
        }

        Err("No QR code found".into())
    }).await.map_err(|e| e.to_string())??;

    Ok(result)
}
