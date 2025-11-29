import {writeFile, BaseDirectory} from '@tauri-apps/plugin-fs';

/**
 * 将 Base64 编码的字符串转换为 Uint8Array
 */
function base64ToUint8Array(base64String: string) {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function saveMediaAsset__forTauri(
  uri: string,
  {fileName}: {fileName: string},
) {
  // if (fileName.endsWith('.jpg')) {
  //   uri = `data:image/jpg;base64,${uri}`;
  // }
  // if (fileName.endsWith('.png')) {
  //   uri = `data:image/png;base64,${uri}`;
  // }
  // console.log(uri);
  // console.log(fileName);

  await writeFile(fileName, new Uint8Array(base64ToUint8Array(uri)), {
    baseDir: BaseDirectory.Download,
  });
}

export default saveMediaAsset__forTauri;
