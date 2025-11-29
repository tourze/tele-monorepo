import {message} from '@tauri-apps/plugin-dialog';

async function alertMessage__forTauri(msg: string, title = '提示') {
  await message(msg, {title, kind: 'info'});
}

export default alertMessage__forTauri;
