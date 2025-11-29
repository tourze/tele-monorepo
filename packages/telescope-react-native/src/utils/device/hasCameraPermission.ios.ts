import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';

async function hasCameraPermission_forIos() {
  const res0 = await check(PERMISSIONS.IOS.CAMERA);
  if (res0 === RESULTS.GRANTED) {
    return true;
  }

  const res1 = await request(PERMISSIONS.IOS.CAMERA);
  if (res1 === RESULTS.GRANTED) {
    return true;
  }
  return false;
}

export default hasCameraPermission_forIos;
