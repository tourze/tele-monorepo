import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { EventCallback, UnlistenFn } from '@tauri-apps/api/event'

declare const __DEV__: boolean | undefined

const DEFAULT_COUNT = 4
const EVENT_BATCH_RESULT = 'TcpPingBatchResult'

export interface BatchPingTarget {
  host?: string
  ip?: string
  port: number
  count?: number
  timeoutMs?: number
  bypassVpn?: boolean
}

export interface BatchPingOptions {
  requestId?: string
  count?: number
  timeoutMs?: number
}

export interface BatchPingResult {
  requestId: string
  host: string | null
  port: number | null
  totalCount: number
  successCount: number
  avgTime: number | null
  success: boolean
  done: boolean
  cancelled: boolean
  error?: string
}

export interface BatchPingHandle {
  requestId: string
  stop: () => void
  dispose: () => void
}

type NormalizedTarget = {
  host?: string
  ip?: string
  port?: number
  count?: number
  timeoutMs?: number
  bypassVpn?: boolean
}

type NormalizedOptions = {
  count?: number
  timeoutMs?: number
}

const batchListeners = new Map<string, UnlistenFn>()

function isDev(): boolean {
  if (typeof __DEV__ === 'boolean') {
    return __DEV__
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env.NODE_ENV === 'string') {
    return process.env.NODE_ENV !== 'production'
  }
  return false
}

function generateRequestId(): string {
  return `tcp-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
}

function normalizeCount(value?: number, fallback: number = DEFAULT_COUNT): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.floor(value))
  }
  return fallback
}

function normalizeTimeout(value?: number): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(100, Math.floor(value))
  }
  return undefined
}

function normalizeOptions(options?: BatchPingOptions): NormalizedOptions | undefined {
  if (!options) return undefined
  const normalized: NormalizedOptions = {}
  if (typeof options.count === 'number') {
    normalized.count = normalizeCount(options.count)
  }
  const timeout = normalizeTimeout(options.timeoutMs)
  if (typeof timeout === 'number') {
    normalized.timeoutMs = timeout
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined
}

function normalizeTargets(targets: BatchPingTarget[]): NormalizedTarget[] {
  return targets.map((item) => {
    const normalized: NormalizedTarget = {}
    if (typeof item.host === 'string') normalized.host = item.host
    if (typeof item.ip === 'string') normalized.ip = item.ip
    if (typeof item.port === 'number' && Number.isFinite(item.port)) normalized.port = item.port
    if (typeof item.count === 'number') normalized.count = normalizeCount(item.count)
    const timeout = normalizeTimeout(item.timeoutMs)
    if (typeof timeout === 'number') normalized.timeoutMs = timeout
    if (typeof item.bypassVpn === 'boolean') normalized.bypassVpn = item.bypassVpn
    return normalized
  })
}

function formatResult(event: Record<string, unknown>): BatchPingResult | null {
  const requestId = typeof event.requestId === 'string' ? event.requestId : null
  if (!requestId) return null
  const host =
    typeof event.host === 'string'
      ? event.host
      : event.host == null
        ? null
        : String(event.host)
  let port: number | null = null
  if (typeof event.port === 'number') {
    port = Number.isFinite(event.port) ? event.port : null
  } else if (typeof event.port === 'string') {
    const parsed = parseInt(event.port, 10)
    port = Number.isFinite(parsed) ? parsed : null
  }
  const totalCount =
    typeof event.totalCount === 'number' && Number.isFinite(event.totalCount)
      ? event.totalCount
      : 0
  const successCount =
    typeof event.successCount === 'number' && Number.isFinite(event.successCount)
      ? event.successCount
      : 0
  let avgTime: number | null = null
  if (typeof event.avgTime === 'number') {
    avgTime = Number.isFinite(event.avgTime) ? event.avgTime : null
  } else if (typeof event.avgTime === 'string') {
    const parsed = parseFloat(event.avgTime)
    avgTime = Number.isFinite(parsed) ? parsed : null
  }
  const success = Boolean(event.success)
  const done = Boolean(event.done)
  const cancelled = Boolean(event.cancelled)
  const error = typeof event.error === 'string' ? event.error : undefined
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
  }
}

function cleanupListener(requestId: string): void {
  const unlisten = batchListeners.get(requestId)
  if (unlisten) {
    batchListeners.delete(requestId)
    try {
      unlisten()
    } catch (err) {
      if (isDev()) {
        console.warn('[tauri-plugin-tcp-ping] 清理监听失败', err)
      }
    }
  }
}

async function attachListener(
  requestId: string,
  onResult: (result: BatchPingResult) => void,
): Promise<void> {
  const handler: EventCallback<BatchPingResult> = (event) => {
    const payload = event.payload || event
    if (!payload || payload.requestId !== requestId) return
    const formatted =
      typeof payload === 'object' && payload !== null
        ? formatResult(payload as Record<string, unknown>)
        : null
    if (!formatted) return
    try {
      onResult(formatted)
    } catch (err) {
      if (isDev()) {
        console.warn('[tauri-plugin-tcp-ping] onResult 执行异常', err)
      }
    }
    if (formatted.done) {
      cleanupListener(requestId)
    }
  }

  const unlisten = await listen<BatchPingResult>(EVENT_BATCH_RESULT, handler)
  batchListeners.set(requestId, unlisten)
}

async function runTcpPing(host: string, port: number, count: number, timeoutMs?: number): Promise<number> {
  const payload: Record<string, unknown> = { host, port, count }
  if (typeof timeoutMs === 'number') {
    payload.timeoutMs = timeoutMs
  }
  return invoke<number>('plugin:tcp-ping|tcping', payload)
}

/**
 * 发起 TCP Ping 并返回平均时延（毫秒）
 */
export async function startPing(
  ip: string,
  port: number,
  times: number = DEFAULT_COUNT,
  options?: { bypassVpn?: boolean; timeoutMs?: number },
): Promise<number | null> {
  if (typeof ip !== 'string' || ip.length === 0) return null
  if (typeof port !== 'number' || !Number.isFinite(port)) return null
  const count = normalizeCount(times)
  const timeout = normalizeTimeout(options?.timeoutMs)
  try {
    const avgTime = await runTcpPing(ip, port, count, timeout)
    return typeof avgTime === 'number' && Number.isFinite(avgTime) ? avgTime : null
  } catch (err) {
    if (isDev()) {
      console.warn('[tauri-plugin-tcp-ping] startPing 调用失败', err)
    }
    return null
  }
}

/**
 * 按照 React Native 版本一致的回调机制执行批量 TCP Ping，由 Rust 层批处理并通过事件推送结果
 */
export function startBatchPing(
  targets: BatchPingTarget[],
  onResult: (result: BatchPingResult) => void,
  options?: BatchPingOptions,
): BatchPingHandle | null {
  if (!Array.isArray(targets) || targets.length === 0) {
    if (isDev()) {
      console.warn('[tauri-plugin-tcp-ping] targets 为空，忽略 startBatchPing 调用')
    }
    return null
  }
  if (typeof onResult !== 'function') {
    throw new Error('onResult 必须是函数')
  }

  const normalizedTargets = normalizeTargets(targets)
  const normalizedOptions = normalizeOptions(options)
  const requestId =
    options?.requestId && options.requestId.length > 0 ? options.requestId : generateRequestId()

  void attachListener(requestId, onResult)
    .then(() => {
      const payload: Record<string, unknown> = {
        requestId,
        targets: normalizedTargets,
      }
      if (normalizedOptions) {
        payload.options = normalizedOptions
      }
      return invoke<string>('plugin:tcp-ping|start_batch_ping', payload)
    })
    .then((realId) => {
      if (realId && realId !== requestId) {
        cleanupListener(requestId)
        void attachListener(realId, onResult)
      }
    })
    .catch((err) => {
      cleanupListener(requestId)
      if (isDev()) {
        console.warn('[tauri-plugin-tcp-ping] startBatchPing 调用失败', err)
      }
    })

  const stop = () => {
    void stopBatchPing(requestId)
  }

  const dispose = () => {
    cleanupListener(requestId)
  }

  return {
    requestId,
    stop,
    dispose,
  }
}

/**
 * 与 React Native 版本一致的 stopBatchPing：通知 Rust 侧停止任务，并移除事件监听
 */
export function stopBatchPing(requestId: string): void {
  if (typeof requestId !== 'string' || requestId.length === 0) return
  cleanupListener(requestId)
  void invoke('plugin:tcp-ping|stop_batch_ping', { requestId }).catch((err) => {
    if (isDev()) {
      console.warn('[tauri-plugin-tcp-ping] stopBatchPing 调用失败', err)
    }
  })
}

export default {
  startPing,
  startBatchPing,
  stopBatchPing,
}
