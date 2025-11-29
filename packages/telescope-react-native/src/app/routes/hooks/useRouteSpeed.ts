/**
 * 线路速度状态管理 Hook
 *
 * 功能：
 * - 集中管理所有节点的 speed 数据
 * - 使用批量更新优化，合并频繁的更新操作
 * - 单一事件监听器，替代每个列表项的独立监听
 */

import {useState, useEffect, useRef, useCallback} from 'react';
import {DeviceEventEmitter} from 'react-native';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import {get} from '../../../hooks/useStorage';
import {STORAGE_EVENT_KEY} from '../../../hooks/storage/shared';

type RouteLineItem = {
  id: string | number;
  ip: string;
  port: number;
  [key: string]: any;
};

interface UseRouteSpeedOptions {
  routeLines?: {list: RouteLineItem[]};
  unmountedRef?: {current: boolean};
}

interface UseRouteSpeedReturn {
  speedMap: Record<string, any>;
  scheduleSpeedUpdate: (key: string, value: any) => void;
  flushSpeedUpdates: () => void;
}

export function useRouteSpeed({
  routeLines,
  unmountedRef,
}: UseRouteSpeedOptions): UseRouteSpeedReturn {
  const [speedMap, setSpeedMap] = useState<Record<string, any>>({});
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());
  const updateTimerRef = useRef<number | null>(null);
  // 记录最近一次成功的测速结果，作为兜底显示
  const lastSuccessRef = useRef<Map<string, {speed: number; updatedAt: number}>>(
    new Map(),
  );

  const CACHE_STALE_MS = 5 * 60 * 1000;

  const normalizeSpeedValue = useCallback((value: any) => {
    if (isObject(value) && value.speed !== undefined) {
      return {
        speed: value.speed,
        updatedAt:
          typeof value.updatedAt === 'number' && Number.isFinite(value.updatedAt)
            ? value.updatedAt
            : undefined,
      };
    }
    return {speed: value, updatedAt: undefined as number | undefined};
  }, []);

  const buildDisplayValue = useCallback(
    (key: string, value: any) => {
      const {speed, updatedAt} = normalizeSpeedValue(value);
      if (typeof speed === 'number' && Number.isFinite(speed)) {
        const ts = Number.isFinite(updatedAt) ? updatedAt! : Date.now();
        lastSuccessRef.current.set(key, {speed, updatedAt: ts});
        return {speed, updatedAt: ts};
      }

      const cached = lastSuccessRef.current.get(key);
      if (cached && Date.now() - cached.updatedAt <= CACHE_STALE_MS) {
        return {...cached, cached: true};
      }

      // 测速失败或缺失时也尝试使用最近缓存，尽量避免 UI 变为占位
      if (speed === false) {
        return cached ? {...cached, cached: true} : false;
      }
      return cached ? {...cached, cached: true} : undefined;
    },
    [CACHE_STALE_MS, normalizeSpeedValue],
  );

  // 立即应用所有待处理的更新
  const flushSpeedUpdates = useCallback(() => {
    if (updateTimerRef.current !== null) {
      clearTimeout(updateTimerRef.current);
      updateTimerRef.current = null;
    }

    if (pendingUpdatesRef.current.size === 0) {
      return;
    }

    const updates: Record<string, any> = {};
    pendingUpdatesRef.current.forEach((value, key) => {
      updates[key] = buildDisplayValue(key, value);
    });

    // 🔥 优化：使用函数式更新确保基于最新状态
    setSpeedMap(prev => ({...prev, ...updates}));
    pendingUpdatesRef.current.clear();
  }, [buildDisplayValue]);

  // 调度 speed 更新，使用 requestAnimationFrame 合并
  const scheduleSpeedUpdate = useCallback(
    (key: string, value: any) => {
      // 🔥 防护：如果组件已卸载，不再调度更新
      if (unmountedRef?.current) {
        return;
      }

      pendingUpdatesRef.current.set(key, value);

      if (updateTimerRef.current === null) {
        // 🔥 优化：使用更长的延迟（50ms）来收集更多更新，减少渲染次数
        updateTimerRef.current = setTimeout(() => {
          updateTimerRef.current = null;
          // 🔥 双重检查：执行时再次确认组件未卸载
          if (!unmountedRef?.current) {
            flushSpeedUpdates();
          }
        }, 50) as unknown as number;
      }
    },
    [flushSpeedUpdates, unmountedRef],
  );

  // 集中式监听所有 speed 变化
  useEffect(() => {
    if (!routeLines?.list || !isArray(routeLines.list)) {
      setSpeedMap({});
      return;
    }

    // 🔥 优化：先设置监听器，再加载初始数据，避免丢失更新
    const listener = async (v: any) => {
      if (!v.key?.startsWith('speed-')) {
        return;
      }

      // 事件里没有值，主动读取一次，避免更新被吞掉
      let value = v.value;
      if (value === undefined) {
        try {
          value = await get(v.key, undefined);
        } catch (err) {
          value = undefined;
        }
      }

      if (unmountedRef?.current) {
        return;
      }
      scheduleSpeedUpdate(v.key, value);
    };

    const subscription = DeviceEventEmitter.addListener(
      STORAGE_EVENT_KEY,
      listener,
    );

    // 🔥 修复：先初始化所有节点的占位符，避免快速滚动时缺少数据
    const initialMap: Record<string, any> = {};
    routeLines.list.forEach((item: RouteLineItem) => {
      const key = `speed-${item.ip}-${item.port}`;
      initialMap[key] = undefined; // 占位符，后续会被真实数据覆盖
    });
    setSpeedMap(initialMap);

    // 异步加载实际的 speed 数据
    Promise.all(
      routeLines.list.map((item: RouteLineItem) => {
        const key = `speed-${item.ip}-${item.port}`;
        return get(key, undefined).then(value => ({key, value}));
      }),
    )
      .then(results => {
        if (unmountedRef?.current) {
          return;
        }
        const loadedMap: Record<string, any> = {};
        results.forEach(({key, value}) => {
          // 🔥 使用内存缓存兜底，避免频繁测速时 UI 回退为占位符
          loadedMap[key] = buildDisplayValue(key, value);
        });
        // 🔥 合并已有的 pending 更新，避免覆盖最新测速结果
        setSpeedMap(prev => ({...prev, ...loadedMap}));
      })
      .catch(err => {
        console.warn('[useRouteSpeed] 初始化 speed 数据失败:', err);
      });

    return () => {
      subscription.remove();
      // 清理待处理的更新
      if (updateTimerRef.current !== null) {
        clearTimeout(updateTimerRef.current);
        updateTimerRef.current = null;
      }
      pendingUpdatesRef.current.clear();
    };
  }, [routeLines, scheduleSpeedUpdate, unmountedRef, buildDisplayValue]);

  return {
    speedMap,
    // 保留这些函数以备将来扩展使用
    scheduleSpeedUpdate,
    flushSpeedUpdates,
  };
}
