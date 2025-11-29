import {stripHtml} from 'string-strip-html';
import Toast from 'react-native-simple-toast';

async function toastSuccess(text: string) {
  Toast.showWithGravity(stripHtml(text).result, Toast.SHORT, Toast.CENTER);
}

export default toastSuccess;
