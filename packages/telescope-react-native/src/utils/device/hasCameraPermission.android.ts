import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';

async function hasCameraPermissionAndroid() {
  const res0 = await check(PERMISSIONS.ANDROID.CAMERA);
  if (res0 === RESULTS.GRANTED) {
    return true;
  }

  const res1 = await request(PERMISSIONS.ANDROID.CAMERA);
  if (res1 === RESULTS.GRANTED) {
    return true;
  }
  return false;
}

export default hasCameraPermissionAndroid;
