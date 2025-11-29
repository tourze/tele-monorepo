import Clipboard from '@react-native-clipboard/clipboard';
import isEmpty from 'lodash/isEmpty';

/**
 * 获取粘贴板的所有内容
 */
async function getClipboardStrings() {
  const str = await Clipboard.getString();
  if (isEmpty(str)) {
    return [];
  }
  return [str];
}

export default getClipboardStrings;
