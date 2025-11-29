import { invoke } from '@tauri-apps/api/core';

async function detectQrCode__forTauri(uri: string) {
  const result = await invoke('plugin:ttmanager|read_qr_code', {imagePath: uri});
  console.log('QR Code Result:', result);
  return result;
}

export default detectQrCode__forTauri;
