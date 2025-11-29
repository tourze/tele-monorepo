import {fetch} from '@tauri-apps/plugin-http';

async function sendGetRequest__forTauri(
  url: string,
  headers?: [],
): Promise<string | null> {
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  // console.log('web sendGetRequest__forTauri', response);
  if (response.status !== 200) {
    return null;
  }
  return await response.text();
}

export default sendGetRequest__forTauri;
