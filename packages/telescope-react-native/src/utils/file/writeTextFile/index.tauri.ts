import { invoke } from '@tauri-apps/api/core';

async function writeTextFile__forTauri(filePath: string, content: string) {
  try {
    await invoke('plugin:ttmanager|write_file', { path: filePath, content });
    console.log('File written successfully');
  } catch (error) {
    console.error('Error writing file:', error);
  }
}

export default writeTextFile__forTauri;
