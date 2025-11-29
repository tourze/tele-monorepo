import {Alert} from 'react-native';

async function alertMessage(msg: string, title = '提示') {
  Alert.alert(title, msg);
}

export default alertMessage;
