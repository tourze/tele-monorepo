import Clipboard from '@react-native-clipboard/clipboard';

async function setClipboardText({text}: {text: string}) {
  Clipboard.setString(text);
}

export default setClipboardText;
