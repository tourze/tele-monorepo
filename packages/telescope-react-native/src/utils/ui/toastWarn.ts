import {stripHtml} from 'string-strip-html';
import Toast from 'react-native-simple-toast';

async function toastWarn(text: string) {
  Toast.showWithGravity(stripHtml(text).result, Toast.SHORT, Toast.CENTER);
}

export default toastWarn;
