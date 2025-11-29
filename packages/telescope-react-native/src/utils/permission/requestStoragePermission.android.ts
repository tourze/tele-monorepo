import {check, PERMISSIONS, RESULTS, request} from 'react-native-permissions';

async function requestStoragePermission_forAndroid() {
  let res0 = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  if (res0 !== RESULTS.GRANTED) {
    res0 = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
  }

  let res1 = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  if (res1 !== RESULTS.GRANTED) {
    res1 = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
  }

  return res0 === RESULTS.GRANTED && res1 === RESULTS.GRANTED;
}

export default requestStoragePermission_forAndroid;
