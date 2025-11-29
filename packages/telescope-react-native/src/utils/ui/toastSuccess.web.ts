import {stripHtml} from 'string-strip-html';
import {message} from '@tauri-apps/plugin-dialog';

async function toastSuccess__forWeb(text: string) {
  await message(stripHtml(`${text}`).result, '成功');
}

export default toastSuccess__forWeb;
