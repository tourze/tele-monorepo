import {readText} from '@tauri-apps/plugin-clipboard-manager';
import isEmpty from 'lodash/isEmpty';

/**
 * 获取粘贴板的所有内容
 */
async function getClipboardStrings__forWeb() {
  const str = await readText();
  if (isEmpty(str)) {
    return [];
  }
  return [str];
}

export default getClipboardStrings__forWeb;
