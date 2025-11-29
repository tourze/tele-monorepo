import {stripHtml} from 'string-strip-html';
import { message } from '@tauri-apps/plugin-dialog';

async function toastWarn__forWeb(text: string) {
  await message(stripHtml(`${text}`).result, '警告');
}

export default toastWarn__forWeb;
