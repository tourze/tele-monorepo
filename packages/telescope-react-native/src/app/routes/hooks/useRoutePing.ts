/**
 * 线路 Ping 测试 Hook
 *
 * 功能：
 * - 批量 ping 测试
 * - 串行 ping 降级
 * - DNS 解析 + Ping 测试的完整流程
 */

import {useRef, useCallback} from 'react';
import {useMemoizedFn, useUnmountedRef, useDebounceFn} from 'ahooks';
import isArray from 'lodash/isArray';
import pLimit from 'p-limit';
import {
  startBatchPing,
  type BatchPingHandle,
  type BatchPingResult,
  type BatchPingTarget,
} from 'react-native-tcp-ping';
import {set} from '../../../hooks/useStorage';
import startPing from '../../../utils/node/startPing';
import {cachedHostToIp} from '../../../utils/network/dns-cache';

const limit = pLimit(5);
const DEFAULT_PING_COUNT = 4;
const DEFAULT_TIMEOUT_MS = 3000;

type RouteLineItem = {
  id: string | number;
  ip: string;
  port: number;
  [key: string]: any;
};

interface UseRoutePingOptions {
  routeLines?: {list: RouteLineItem[]};
  buildSpeedPayload: (value: number | false) => any;
  onSpeedChange?: (storeKey: string, payload: any) => void;
}

interface UseRoutePingReturn {
  refreshAll: {
    run: () => void;
    cancel: () => void;
  };
}

const buildTargetKey = (host?: string | null, port?: number | null) =>
  `${host ?? ''}@@${port ?? ''}`;

export function useRoutePing({
  routeLines,
  buildSpeedPayload,
  onSpeedChange,
}: UseRoutePingOptions): UseRoutePingReturn {
  const unmountedRef = useUnmountedRef();
  const batchHandleRef = useRef<BatchPingHandle | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const targetStoreKeyMapRef = useRef<Map<string, string>>(new Map());
  const hasWarnedBatchFallbackRef = useRef(false);

  const releaseHandle = useMemoizedFn((stopNative: boolean) => {
    const handle = batchHandleRef.current;
    if (handle) {
      if (stopNative) {
        try {
          handle.stop();
        } catch (err) {
          // ignore
        }
      }
      try {
        handle.dispose();
      } catch (err) {
        // ignore
      }
    }
    batchHandleRef.current = null;
    activeRequestIdRef.current = null;
    targetStoreKeyMapRef.current = new Map();
  });

  const runSequentialPing = useMemoizedFn(
    async (entries: Array<{item: RouteLineItem; host: string}>) => {
      if (!entries.length) {
        return;
      }
      await Promise.all(
        entries.map(({item, host}) =>
          limit(async () => {
            if (unmountedRef.current) {
              return;
            }
            const port = Number(item.port);
            const storeKey = `speed-${item.ip}-${item.port}`;
            if (!Number.isFinite(port)) {
              try {
                await set(storeKey, false);
              } catch (err) {
                // ignore storage error
              }
              return;
            }

            let value: number | false = false;
            try {
              const res = await startPing(
                host && host.length > 0 ? host : item.ip,
                port,
                DEFAULT_PING_COUNT,
                {bypassVpn: false},
              );
              if (res !== null && res !== undefined) {
                const parsed = parseInt(String(res), 10);
                if (Number.isFinite(parsed)) {
                  value = parsed;
                }
              }
            } catch (err) {
              value = false;
            }

            console.log('set', storeKey, value);
            const payload = buildSpeedPayload(value);
            onSpeedChange?.(storeKey, payload);
            try {
              // 🔥 修复：只写 storage，让 useRouteSpeed 的事件监听器处理状态更新
              await set(storeKey, payload);
            } catch (err) {
              // ignore storage error
            }
          }),
        ),
      );
    },
  );

  const refreshAllInternal = useCallback(async () => {
    if (routeLines === undefined || routeLines === null) {
      releaseHandle(true);
      return;
    }
    if (!isArray(routeLines.list) || routeLines.list.length === 0) {
      releaseHandle(true);
      return;
    }

    releaseHandle(true);

    // 使用带缓存的 DNS 解析
    const resolved = await Promise.all(
      routeLines.list.map(async (item: RouteLineItem) => {
        const host = await cachedHostToIp(item.ip);
        return {item, host};
      }),
    );

    if (unmountedRef.current) {
      return;
    }

    const storeMap = new Map<string, string>();
    const targets: BatchPingTarget[] = [];
    const sequentialEntries: Array<{item: RouteLineItem; host: string}> = [];

    resolved.forEach(({item, host}) => {
      const port = Number(item.port);
      const normalizedHost =
        typeof host === 'string' && host.length > 0 ? host : item.ip;
      sequentialEntries.push({item, host: normalizedHost});

      if (!Number.isFinite(port) || !normalizedHost) {
        return;
      }

      const storeKey = `speed-${item.ip}-${port}`;
      storeMap.set(buildTargetKey(normalizedHost, port), storeKey);
      storeMap.set(buildTargetKey(item.ip, port), storeKey);

      targets.push({
        host: normalizedHost,
        port,
        count: DEFAULT_PING_COUNT,
        bypassVpn: false,
      });
    });

    targetStoreKeyMapRef.current = storeMap;

    if (!targets.length) {
      await runSequentialPing(sequentialEntries);
      return;
    }

    const onBatchResult = (result: BatchPingResult) => {
      if (result.requestId !== activeRequestIdRef.current) {
        return;
      }
      if (unmountedRef.current) {
        return;
      }

      if (result.host == null || result.port == null) {
        if (result.done) {
          releaseHandle(false);
        }
        return;
      }

      const storeKey = targetStoreKeyMapRef.current.get(
        buildTargetKey(result.host, result.port),
      );
      if (!storeKey) {
        return;
      }

      let value: number | false = false;
      if (result.success && result.avgTime != null) {
        const parsed = parseInt(String(result.avgTime), 10);
        if (Number.isFinite(parsed)) {
          value = parsed;
        }
      }
      if (!result.success || result.avgTime == null) {
        value = false;
      }

      console.log('set', storeKey, value);
      const payload = buildSpeedPayload(value);
      onSpeedChange?.(storeKey, payload);
      // 🔥 修复：只写 storage，让 useRouteSpeed 的事件监听器处理状态更新
      set(storeKey, payload).catch(() => {});

      if (result.done) {
        releaseHandle(false);
      }
    };

    let handle: BatchPingHandle | null = null;
    try {
      handle = startBatchPing(targets, onBatchResult, {
        count: DEFAULT_PING_COUNT,
        timeoutMs: DEFAULT_TIMEOUT_MS,
      });
    } catch (err) {
      handle = null;
    }

    if (handle) {
      batchHandleRef.current = handle;
      activeRequestIdRef.current = handle.requestId;
    } else {
      if (!hasWarnedBatchFallbackRef.current) {
        console.warn('[useRoutePing] startBatchPing 不可用，降级为串行测速');
        hasWarnedBatchFallbackRef.current = true;
      }
      releaseHandle(false);
      await runSequentialPing(sequentialEntries);
    }
  }, [
    routeLines,
    releaseHandle,
    buildSpeedPayload,
    runSequentialPing,
    unmountedRef,
  ]);

  // 🔥 修复：恢复防抖逻辑，避免重复调用
  const refreshAll = useDebounceFn(
    refreshAllInternal,
    {
      leading: true,  // 立即执行第一次
      trailing: false, // 忽略后续调用
      wait: 100,
    },
  );

  const refreshAllCancel = useMemoizedFn(() => {
    refreshAll.cancel();
    releaseHandle(true);
  });

  return {
    refreshAll: {
      run: refreshAll.run,
      cancel: refreshAllCancel,
    },
  };
}
