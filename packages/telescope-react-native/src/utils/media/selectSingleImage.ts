import ImagePicker from 'react-native-image-crop-picker';
import Tracking from '../tracking/Tracking';

async function selectSingleImage() {
  let uri;
  try {
    const result = await ImagePicker.openPicker({
      multiple: false,
      minFiles: 1,
      maxFiles: 1,
      mediaType: 'photo',
    });
    if (result.path) {
      uri = result.path;
    }
    console.log('photo result', result);
  } catch (err) {
    Tracking.info('RecoverAccountAndroid选照片失败', {
      err,
    });
  }
  return uri;
}

export default selectSingleImage;
