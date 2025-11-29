import {writeText} from '@tauri-apps/plugin-clipboard-manager';

async function setClipboardText__forWeb({text}: {text: string}) {
  await writeText(text);
}

export default setClipboardText__forWeb;
