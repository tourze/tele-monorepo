import AsyncStorage from '@react-native-async-storage/async-storage';
import getCacheKey from './getCacheKey';

async function removeStorageItem(key: string) {
  return await AsyncStorage.removeItem(await getCacheKey(key));
}

export default removeStorageItem;
