import Clipboard from '@react-native-clipboard/clipboard';

/**
 * ios可以直接取得多次粘贴板内容，所以直接在这里做了
 */
async function getClipboardStrings_forIOS() {
  return await Clipboard.getStrings();
}

export default getClipboardStrings_forIOS;
