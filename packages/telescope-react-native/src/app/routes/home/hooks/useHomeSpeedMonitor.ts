import { useEffect, useMemo, useRef } from 'react';
import { useInterval, useMemoizedFn } from 'ahooks';
import { startBatchPing } from 'react-native-tcp-ping';
import type {
  BatchPingHandle,
  BatchPingResult,
} from 'react-native-tcp-ping';
import hostToIp from '../../../../utils/network/hostToIp';
import startPing from '../../../../utils/node/startPing';
import { set as setStorageValue } from '../../../../hooks/useStorage';

const SPEED_REFRESH_INTERVAL = 10000;
const SPEED_REFRESH_COOLDOWN = 3000;
const PING_DEFAULT_COUNT = 4;
const PING_DEFAULT_TIMEOUT = 3000;

type CurrentNode = {
  ip?: string;
  port?: number | string;
};

const useHomeSpeedMonitor = (currentNode: CurrentNode | null | undefined) => {
  const speedBatchHandleRef = useRef<BatchPingHandle | null>(null);
  const speedBatchRequestIdRef = useRef<string | null>(null);
  const speedStoreKeysRef = useRef<Set<string>>(new Set());
  const lastSpeedRefreshAtRef = useRef<number>(0);

  const releaseSpeedHandle = useMemoizedFn((stopNative: boolean) => {
    const handle = speedBatchHandleRef.current;
    if (handle) {
      if (stopNative) {
        try {
          handle.stop();
        } catch (err) {}
      }
      try {
        handle.dispose();
      } catch (err) {}
    }
    speedBatchHandleRef.current = null;
    speedBatchRequestIdRef.current = null;
    speedStoreKeysRef.current = new Set();
    if (stopNative) {
      lastSpeedRefreshAtRef.current = 0;
    }
  });

  const buildSpeedPayload = useMemoizedFn((value: number | false) => {
    if (value === false) {
      return false;
    }
    return {
      speed: value,
      updatedAt: Date.now(),
    };
  });

  const updateSpeedCache = useMemoizedFn(async (value: number | false) => {
    const keys = Array.from(speedStoreKeysRef.current);
    if (keys.length === 0) {
      return;
    }
    const payload = buildSpeedPayload(value);
    await Promise.all(
      keys.map(async key => {
        try {
          await setStorageValue(key, payload);
        } catch (err) {}
      }),
    );
  });

  const refreshCurrentNodeSpeed = useMemoizedFn(
    async (options?: { force?: boolean }) => {
      const force = options?.force ?? false;
      const node = currentNode;
      if (!node || !node.ip || !node.port) {
        releaseSpeedHandle(true);
        speedStoreKeysRef.current = new Set();
        return;
      }

      if (!force && speedBatchHandleRef.current) {
        return;
      }

      const now = Date.now();
      if (
        !force &&
        lastSpeedRefreshAtRef.current !== 0 &&
        now - lastSpeedRefreshAtRef.current < SPEED_REFRESH_COOLDOWN
      ) {
        return;
      }

      const port = Number(node.port);
      const rawKey = `speed-${node.ip}-${node.port}`;
      if (!Number.isFinite(port)) {
        speedStoreKeysRef.current = new Set([rawKey]);
        await updateSpeedCache(false);
        releaseSpeedHandle(true);
        return;
      }

      let resolvedHost = node.ip;
      try {
        const host = await hostToIp(node.ip);
        if (typeof host === 'string' && host.length > 0) {
          resolvedHost = host;
        }
      } catch (err) {}

      const storeKeys = new Set<string>();
      storeKeys.add(rawKey);
      if (resolvedHost !== node.ip) {
        storeKeys.add(`speed-${resolvedHost}-${port}`);
      }
      speedStoreKeysRef.current = storeKeys;

      releaseSpeedHandle(true);
      lastSpeedRefreshAtRef.current = Date.now();

      const onBatchResult = (result: BatchPingResult) => {
        if (result.requestId !== speedBatchRequestIdRef.current) {
          return;
        }
        if (result.host == null || result.port == null) {
          if (result.done) {
            releaseSpeedHandle(false);
          }
          return;
        }
        if (Number(result.port) !== port) {
          return;
        }
        let value: number | false = false;
        if (result.success && result.avgTime != null) {
          const parsed = parseInt(String(result.avgTime), 10);
          if (Number.isFinite(parsed)) {
            value = parsed;
          }
        }
        updateSpeedCache(value).catch(() => {});
        if (result.done) {
          releaseSpeedHandle(false);
        }
      };

      let handle: BatchPingHandle | null = null;
      try {
        handle = startBatchPing(
          [
            {
              host: resolvedHost,
              port,
              count: PING_DEFAULT_COUNT,
              bypassVpn: false,
            },
          ],
          onBatchResult,
          {
            count: PING_DEFAULT_COUNT,
            timeoutMs: PING_DEFAULT_TIMEOUT,
          },
        );
      } catch (err) {
        handle = null;
      }

      if (handle) {
        speedBatchHandleRef.current = handle;
        speedBatchRequestIdRef.current = handle.requestId;
        return;
      }

      try {
        const res = await startPing(resolvedHost, port, PING_DEFAULT_COUNT, {
          bypassVpn: false,
        });
        if (res !== null && res !== undefined) {
          const parsed = parseInt(String(res), 10);
          if (Number.isFinite(parsed)) {
            await updateSpeedCache(parsed);
            return;
          }
        }
        await updateSpeedCache(false);
      } catch (err) {
        await updateSpeedCache(false);
      }
    },
  );

  useEffect(() => {
    refreshCurrentNodeSpeed({ force: true });
  }, [currentNode, refreshCurrentNodeSpeed]);

  useInterval(
    () => {
      refreshCurrentNodeSpeed();
    },
    currentNode ? SPEED_REFRESH_INTERVAL : undefined,
  );

  useEffect(() => {
    return () => {
      releaseSpeedHandle(true);
    };
  }, [releaseSpeedHandle]);

  return useMemo(
    () => ({
      refreshCurrentNodeSpeed,
    }),
    [refreshCurrentNodeSpeed],
  );
};

export default useHomeSpeedMonitor;
