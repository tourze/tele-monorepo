import {stripHtml} from 'string-strip-html';
import Toast from 'react-native-simple-toast';

const friendlyMessages: any = {
  'Network request failed': '网络节点不稳定，请尝试进入个人中心→关于我们→重新检查API环境',
  'Request Timeout': '网络不稳定，请尝试重启APP或更换网络',
};

async function toastError(text: string) {
  text = stripHtml(text).result;
  text = friendlyMessages[text] === undefined ? text : friendlyMessages[text];
  Toast.showWithGravity(text, Toast.SHORT, Toast.CENTER);
}

export default toastError;
