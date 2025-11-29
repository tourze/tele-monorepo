import {Alert} from 'react-native';

function confirm(
  title = '',
  msg = '',
  confirmLabel = '确认',
  cancelLabel = '取消',
) {
  return new Promise((resolve, reject) => {
    Alert.alert(title, msg, [
      {
        text: cancelLabel,
        onPress: reject,
        style: 'cancel',
      },
      {
        text: confirmLabel,
        onPress: resolve,
        style: 'default',
      },
    ]);
  });
}

export default confirm;
