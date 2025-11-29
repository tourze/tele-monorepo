import {Dirs} from 'react-native-file-access';

async function getDataDir__forIOS() {
  return Dirs.CacheDir;
}

export default getDataDir__forIOS;
