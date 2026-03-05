use base64::{engine::general_purpose::STANDARD, Engine};

/// Read a file from disk and return its content as a Base64-encoded string.
#[tauri::command]
fn read_file_as_base64(path: String) -> Result<String, String> {
    let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
    Ok(STANDARD.encode(&bytes))
}

/// Decode a Base64 string and write it to disk.
#[tauri::command]
fn write_file_from_base64(path: String, data: String) -> Result<(), String> {
    let bytes = STANDARD.decode(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, bytes).map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_file_as_base64, write_file_from_base64])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
