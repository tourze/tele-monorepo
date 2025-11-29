import AsyncStorage from '@react-native-async-storage/async-storage';
import getCacheKey from './getCacheKey';

async function setStorageItem(key: string, value: any) {
  return await AsyncStorage.setItem(await getCacheKey(key), value);
}

export default setStorageItem;
