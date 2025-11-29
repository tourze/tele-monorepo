// 跨端导出：优先走新架构 TurboModule，其次旧架构 NativeModules
import Native from "./NativeTcpPing";
import { NativeEventEmitter, NativeModules } from "react-native";
import type { EmitterSubscription } from "react-native";

const EVENT_BATCH_RESULT = "TcpPingBatchResult";

export interface BatchPingTarget {
  host?: string;
  ip?: string;
  port: number;
  count?: number;
  timeoutMs?: number;
  bypassVpn?: boolean;
}

export interface BatchPingOptions {
  requestId?: string;
  count?: number;
  timeoutMs?: number;
}

export interface BatchPingResult {
  requestId: string;
  host: string | null;
  port: number | null;
  totalCount: number;
  successCount: number;
  avgTime: number | null;
  success: boolean;
  done: boolean;
  cancelled: boolean;
  error?: string;
}

export interface BatchPingHandle {
  requestId: string;
  stop: () => void;
  dispose: () => void;
}

type NativeModuleShape = {
  startPing?: (
    host: string,
    port: number,
    count: number,
    bypassVpn: boolean,
  ) => Promise<number | null>;
  startBatchPing?: (
    requestId: string,
    targets: Array<Record<string, unknown>>,
    options?: Record<string, unknown>,
  ) => void;
  stopBatchPing?: (requestId: string) => void;
} & Record<string, unknown>;

let sharedEmitter: NativeEventEmitter | null = null;

function getNativeModule(): NativeModuleShape | null {
  // TurboModule 情况下优先走 codegen 导出的模块
  if (Native && typeof Native === "object") {
    return Native as unknown as NativeModuleShape;
  }
  const legacy = NativeModules?.TcpPing;
  return legacy && typeof legacy === "object" ? (legacy as NativeModuleShape) : null;
}

function ensureEmitter(): NativeEventEmitter | null {
  const module = getNativeModule();
  if (!module) return null;
  if (!sharedEmitter) {
    sharedEmitter = new NativeEventEmitter(module as never);
  }
  return sharedEmitter;
}

function generateRequestId(): string {
  return `tcp-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function normalizeOptions(options?: BatchPingOptions): Record<string, number> | undefined {
  if (!options) return undefined;
  const out: Record<string, number> = {};
  if (typeof options.count === "number" && Number.isFinite(options.count)) {
    out.count = Math.max(1, Math.floor(options.count));
  }
  if (typeof options.timeoutMs === "number" && Number.isFinite(options.timeoutMs)) {
    out.timeoutMs = Math.max(100, Math.floor(options.timeoutMs));
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function normalizeTargets(targets: BatchPingTarget[]): Array<Record<string, unknown>> {
  return targets.map((item) => {
    const normalized: Record<string, unknown> = {};
    if (typeof item.host === "string") normalized.host = item.host;
    if (typeof item.ip === "string") normalized.ip = item.ip;
    if (typeof item.port === "number" && Number.isFinite(item.port)) {
      normalized.port = item.port;
    }
    if (typeof item.count === "number" && Number.isFinite(item.count)) {
      normalized.count = Math.max(1, Math.floor(item.count));
    }
    if (typeof item.timeoutMs === "number" && Number.isFinite(item.timeoutMs)) {
      normalized.timeoutMs = Math.max(100, Math.floor(item.timeoutMs));
    }
    if (typeof item.bypassVpn === "boolean") {
      normalized.bypassVpn = item.bypassVpn;
    }
    return normalized;
  });
}

function callNativeStartBatch(
  requestId: string,
  targets: Array<Record<string, unknown>>,
  options?: Record<string, number>,
): void {
  const native = getNativeModule();
  if (native?.startBatchPing) {
    native.startBatchPing(requestId, targets, options);
    return;
  }
  if (__DEV__) {
    console.warn("[react-native-tcp-ping] startBatchPing 未找到原生实现");
  }
}

function callNativeStopBatch(requestId: string): void {
  const native = getNativeModule();
  if (native?.stopBatchPing) {
    native.stopBatchPing(requestId);
    return;
  }
  if (__DEV__) {
    console.warn("[react-native-tcp-ping] stopBatchPing 未找到原生实现");
  }
}

function formatResult(event: Record<string, unknown>): BatchPingResult | null {
  const requestId = typeof event.requestId === "string" ? event.requestId : null;
  if (!requestId) return null;
  const host =
    typeof event.host === "string"
      ? event.host
      : event.host == null
        ? null
        : String(event.host);
  let port: number | null = null;
  if (typeof event.port === "number") {
    port = Number.isFinite(event.port) ? event.port : null;
  } else if (typeof event.port === "string") {
    const parsed = parseInt(event.port, 10);
    port = Number.isFinite(parsed) ? parsed : null;
  }
  const totalCount =
    typeof event.totalCount === "number" && Number.isFinite(event.totalCount)
      ? event.totalCount
      : 0;
  const successCount =
    typeof event.successCount === "number" && Number.isFinite(event.successCount)
      ? event.successCount
      : 0;
  let avgTime: number | null = null;
  if (typeof event.avgTime === "number") {
    avgTime = Number.isFinite(event.avgTime) ? event.avgTime : null;
  } else if (typeof event.avgTime === "string") {
    const parsed = parseInt(event.avgTime, 10);
    avgTime = Number.isFinite(parsed) ? parsed : null;
  }
  const success = Boolean(event.success);
  const done = Boolean(event.done);
  const cancelled = Boolean(event.cancelled);
  const error = typeof event.error === "string" ? event.error : undefined;
  return {
    requestId,
    host,
    port,
    totalCount,
    successCount,
    avgTime,
    success,
    done,
    cancelled,
    error,
  };
}

/**
 * 发起 TCP Ping 并返回平均时延（毫秒）
 * @param ip 目标 IP 或域名（建议传已解析 IP）
 * @param port 目标端口
 * @param times 发送次数，默认 4
 */
export async function startPing(
  ip: string,
  port: number,
  times: number = 4,
  options?: { bypassVpn?: boolean },
): Promise<number | null> {
  try {
    if (Native && typeof Native.startPing === "function") {
      return await Native.startPing(ip, port, times, options?.bypassVpn ?? true);
    }
  } catch (e) {
    // 尝试旧桥接回退
  }
  const legacy = NativeModules?.TcpPing as NativeModuleShape | undefined;
  if (legacy && typeof legacy.startPing === "function") {
    const res = await legacy.startPing(ip, port, times, options?.bypassVpn ?? true);
    if (typeof res === "number") return res;
    if (res && typeof (res as Record<string, unknown>).avgTime !== "undefined") {
      const v = parseInt(String((res as Record<string, unknown>).avgTime), 10);
      return Number.isFinite(v) ? v : null;
    }
    return (res as number | null) ?? null;
  }
  if (__DEV__) {
    console.warn("[react-native-tcp-ping] 未找到原生实现，返回 null");
  }
  return null;
}

/**
 * 开始批量并行 TCP Ping，结果通过回调多次返回
 * @param targets 需要探测的 IP/端口列表
 * @param onResult 结果回调，原生会多次触发，同一个 requestId 对应一个批次
 * @param options 默认次数/超时时间/自定义 requestId
 */
export function startBatchPing(
  targets: BatchPingTarget[],
  onResult: (result: BatchPingResult) => void,
  options?: BatchPingOptions,
): BatchPingHandle | null {
  const emitter = ensureEmitter();
  const native = getNativeModule();
  if (!emitter || !native?.startBatchPing) {
    if (__DEV__) {
      console.warn("[react-native-tcp-ping] 当前环境不支持 startBatchPing");
    }
    return null;
  }

  const requestId = options?.requestId && options.requestId.length > 0 ? options.requestId : generateRequestId();
  const normalizedTargets = normalizeTargets(targets);
  const normalizedOptions = normalizeOptions(options);

  let subscription: EmitterSubscription | null = null;
  const handleEvent = (event: Record<string, unknown>) => {
    if (!event || event.requestId !== requestId) return;
    const formatted = formatResult(event);
    if (!formatted) return;
    onResult(formatted);
    if (formatted.done && subscription) {
      subscription.remove();
      subscription = null;
    }
  };
  subscription = emitter.addListener(EVENT_BATCH_RESULT, handleEvent);

  try {
    callNativeStartBatch(requestId, normalizedTargets, normalizedOptions);
  } catch (err) {
    if (subscription) {
      subscription.remove();
      subscription = null;
    }
    throw err;
  }

  const dispose = () => {
    if (subscription) {
      subscription.remove();
      subscription = null;
    }
  };

  const stop = () => {
    callNativeStopBatch(requestId);
  };

  return {
    requestId,
    stop,
    dispose,
  };
}

/**
 * 主动停止批量 Ping
 */
export function stopBatchPing(requestId: string): void {
  callNativeStopBatch(requestId);
}

export default {
  startPing,
  startBatchPing,
  stopBatchPing,
};
