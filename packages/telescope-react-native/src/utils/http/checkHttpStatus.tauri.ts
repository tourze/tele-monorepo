import { fetch } from '@tauri-apps/plugin-http';

async function checkHttpStatus__forTauri(url: string, statusCode: number): Promise<boolean> {
  console.log('checkHttpStatus__forTauri', url, statusCode);
  const response = await fetch(url, {
    method: 'GET',
  });
  return response.status === statusCode;
}

export default checkHttpStatus__forTauri;
