import AsyncStorage from '@react-native-async-storage/async-storage';
import getCacheKey from './getCacheKey';

async function getStorageItem(key: string) {
  return await AsyncStorage.getItem(await getCacheKey(key));
}

export default getStorageItem;
