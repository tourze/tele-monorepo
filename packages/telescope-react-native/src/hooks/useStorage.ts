import { useState, useEffect, useCallback, useRef } from 'react';
import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import Tracking from '../utils/tracking/Tracking';
import {
  STORAGE_EVENT_KEY,
  refresh,
  get,
  set,
  remove,
} from './storage/shared';

const useStorage = function (key: string, defaultValue: any = null) {
  const [data, setData] = useState<any>(defaultValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  // 使用 useRef 来存储订阅对象
  const subscriptionRef = useRef<EmitterSubscription | null>(null);

  // 第一次进入先尝试读取
  useEffect(() => {
    let isMounted = true; // 标记组件是否挂载

    // console.log('load storage', key, JSON.stringify(defaultValue));
    get(key, defaultValue)
      .then(function (jsonValue) {
        if (isMounted) {
          setData(jsonValue);
          setLoading(false);
          setError(null);
        }
      })
      .catch(err => {
        if (isMounted) {
          setData(defaultValue);
          setLoading(false);
          setError(err);
        }
      });

    return () => {
      isMounted = false; // 组件卸载时设置标记
    };
  }, [key, defaultValue]);

  // 监听其他来源的变化
  useEffect(() => {
    const listener = async (v: any) => {
      if (v.key === key) {
        try {
          const newV = await get(v.key, defaultValue);
          setData(newV);
        } catch (e: any) {
          setData(defaultValue);
          Tracking.info('同步Storage错误', {
            key,
            error: e,
          });
        }
      }
    };

    // 添加监听器并存储订阅对象到 ref
    const subscription = DeviceEventEmitter.addListener(
      STORAGE_EVENT_KEY,
      listener,
    );
    subscriptionRef.current = subscription;

    // 清理函数
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [key, defaultValue]);

  // 更新
  const update = useCallback(
    async (updatedValue: any) => {
      setData(updatedValue);
      try {
        await set(key, updatedValue);
      } catch (e: any) {
        // console.warn('useStorage更新失败', e);
        return;
      }
      refresh(key);
    },
    [key],
  );

  // 删除
  const removeFunc = useCallback(async () => {
    setData(defaultValue);
    try {
      await remove(key);
    } catch (e: any) {
      // console.warn('useStorage删除失败', e);
      return;
    }
    refresh(key);
  }, [defaultValue, key]);

  return {
    data, // 当前的最新值
    loading, // 是否加载中
    error, // 错误
    update, // 更新值使用这个方法
    remove: removeFunc, // 删除值使用这个方法
  };
};

export default useStorage;
export { refresh, set, get, remove };
