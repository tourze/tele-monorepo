import {Dirs} from 'react-native-file-access';

async function getDataDir_forAndroid() {
  return Dirs.DocumentDir;
}

export default getDataDir_forAndroid;
