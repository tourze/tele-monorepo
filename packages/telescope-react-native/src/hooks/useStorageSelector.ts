import { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import {
  STORAGE_EVENT_KEY,
  get,
} from './storage/shared';

const identitySelector = (value: any) => value;
const defaultEquality = <T,>(a: T, b: T) => Object.is(a, b);

type UseStorageSelectorOptions<TValue, TSelected> = {
  defaultValue?: TValue;
  isEqual?: (prev: TSelected, next: TSelected) => boolean;
};

/**
 * 使用 selector 精准订阅 storage 指定字段，避免无关 key 变化导致重复渲染
 */
const useStorageSelector = <TValue = any, TSelected = TValue>(
  key: string,
  selector?: (value: TValue) => TSelected,
  options: UseStorageSelectorOptions<TValue, TSelected> = {},
) => {
  const {
    defaultValue = null,
    isEqual = defaultEquality,
  } = options;
  const selectorRef = useRef<(value: TValue) => TSelected>(
    selector
      ? selector
      : ((identitySelector as unknown) as (value: TValue) => TSelected),
  );
  const isEqualRef = useRef(isEqual);
  const defaultValueRef = useRef(defaultValue);

  useEffect(() => {
    selectorRef.current = selector
      ? selector
      : ((identitySelector as unknown) as (value: TValue) => TSelected);
  }, [selector]);

  useEffect(() => {
    isEqualRef.current = isEqual;
  }, [isEqual]);

  useEffect(() => {
    defaultValueRef.current = defaultValue;
  }, [defaultValue]);

  const [state, setState] = useState<{
    loading: boolean;
    error: any;
    value: TSelected;
  }>({
    loading: true,
    error: null,
    value: selectorRef.current(defaultValueRef.current as TValue),
  });

  const evaluate = useCallback(async () => {
    try {
      const raw = await get(key, defaultValueRef.current);
      const nextValue = selectorRef.current(raw as TValue);
      setState(prev => {
        if (isEqualRef.current(prev.value, nextValue)) {
          if (prev.loading) {
            return {
              loading: false,
              error: null,
              value: prev.value,
            };
          }
          return prev;
        }
        return {
          loading: false,
          error: null,
          value: nextValue,
        };
      });
    } catch (err) {
      setState({
        loading: false,
        error: err,
        value: selectorRef.current(defaultValueRef.current as TValue),
      });
    }
  }, [key]);

  useEffect(() => {
    evaluate();
  }, [evaluate]);

  useEffect(() => {
    const listener = async (v: any) => {
      if (v.key !== key) {
        return;
      }
      await evaluate();
    };

    const subscription = DeviceEventEmitter.addListener(
      STORAGE_EVENT_KEY,
      listener,
    );
    return () => {
      subscription.remove();
    };
  }, [evaluate, key]);

  const refresh = useCallback(async () => {
    await evaluate();
  }, [evaluate]);

  return {
    data: state.value,
    loading: state.loading,
    error: state.error,
    refresh,
  };
};

export type { UseStorageSelectorOptions };
export default useStorageSelector;
