import {stripHtml} from 'string-strip-html';
import {message} from '@tauri-apps/plugin-dialog';

async function toastError__forWeb(text: string) {
  await message(stripHtml(`${text}`).result, '提示');
}

export default toastError__forWeb;
