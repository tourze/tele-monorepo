import { DeviceEventEmitter } from 'react-native';
import getStorageItem from '../../utils/storage/getStorageItem';
import setStorageItem from '../../utils/storage/setStorageItem';
import removeStorageItem from '../../utils/storage/removeStorageItem';

const STORAGE_EVENT_KEY = 'storage_change';

// 触发全局存储刷新事件
const refresh = (key: string) => {
  DeviceEventEmitter.emit(STORAGE_EVENT_KEY, { key });
};

// 读取存储
const get = async <T = any>(key: string, defaultValue: T | null = null) => {
  try {
    const jsonValue = await getStorageItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// 写入存储
const set = async (key: string, data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await setStorageItem(key, jsonValue);
  } catch (e) {
    return;
  }

  refresh(key);
};

// 删除存储
const remove = async (key: string) => {
  await removeStorageItem(key);
  refresh(key);
};

export { STORAGE_EVENT_KEY, refresh, get, set, remove };
