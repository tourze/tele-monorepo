import { NativeEventEmitter, NativeModules } from "react-native";
import NativeUdpModule, { type NativeUdpMessageEvent, type NativeUdpSocketConfig } from "./NativeUdp";
import type { EmitterSubscription } from "react-native";

const EVENT_ON_MESSAGE = "udpOnMessage";

type BufferSource = ArrayBuffer | ArrayBufferView | Uint8Array;

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function hasTextEncoder(): boolean {
  return typeof globalThis.TextEncoder !== "undefined";
}

function hasTextDecoder(): boolean {
  return typeof globalThis.TextDecoder !== "undefined";
}

function encodeUtf8(text: string): Uint8Array {
  if (hasTextEncoder()) {
    return new TextEncoder().encode(text);
  }
  const codePoints: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    let code = text.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < text.length) {
      const next = text.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i += 1;
      }
    }
    if (code <= 0x7f) {
      codePoints.push(code);
    } else if (code <= 0x7ff) {
      codePoints.push(0xc0 | (code >> 6));
      codePoints.push(0x80 | (code & 0x3f));
    } else if (code <= 0xffff) {
      codePoints.push(0xe0 | (code >> 12));
      codePoints.push(0x80 | ((code >> 6) & 0x3f));
      codePoints.push(0x80 | (code & 0x3f));
    } else {
      codePoints.push(0xf0 | (code >> 18));
      codePoints.push(0x80 | ((code >> 12) & 0x3f));
      codePoints.push(0x80 | ((code >> 6) & 0x3f));
      codePoints.push(0x80 | (code & 0x3f));
    }
  }
  return new Uint8Array(codePoints);
}

function decodeUtf8(bytes: Uint8Array): string {
  if (hasTextDecoder()) {
    return new TextDecoder().decode(bytes);
  }
  let result = "";
  for (let i = 0; i < bytes.length; ) {
    const byte1 = bytes[i++];
    if (byte1 < 0x80) {
      result += String.fromCharCode(byte1);
      continue;
    }
    if ((byte1 & 0xe0) === 0xc0) {
      const byte2 = bytes[i++] & 0x3f;
      result += String.fromCharCode(((byte1 & 0x1f) << 6) | byte2);
      continue;
    }
    if ((byte1 & 0xf0) === 0xe0) {
      const byte2 = bytes[i++] & 0x3f;
      const byte3 = bytes[i++] & 0x3f;
      result += String.fromCharCode(((byte1 & 0x0f) << 12) | (byte2 << 6) | byte3);
      continue;
    }
    const byte2 = bytes[i++] & 0x3f;
    const byte3 = bytes[i++] & 0x3f;
    const byte4 = bytes[i++] & 0x3f;
    let codePoint = ((byte1 & 0x07) << 18) | (byte2 << 12) | (byte3 << 6) | byte4;
    codePoint -= 0x10000;
    result += String.fromCharCode(0xd800 + (codePoint >> 10));
    result += String.fromCharCode(0xdc00 + (codePoint & 0x3ff));
  }
  return result;
}

function encodeBase64(data: Uint8Array): string {
  if (data.length === 0) return "";
  let output = "";
  for (let i = 0; i < data.length; i += 3) {
    const a = data[i];
    const b = i + 1 < data.length ? data[i + 1] : 0;
    const c = i + 2 < data.length ? data[i + 2] : 0;
    const triplet = (a << 16) | (b << 8) | c;
    output += BASE64_ALPHABET[(triplet >> 18) & 0x3f];
    output += BASE64_ALPHABET[(triplet >> 12) & 0x3f];
    output += i + 1 < data.length ? BASE64_ALPHABET[(triplet >> 6) & 0x3f] : "=";
    output += i + 2 < data.length ? BASE64_ALPHABET[triplet & 0x3f] : "=";
  }
  return output;
}

function decodeBase64(input: string): Uint8Array {
  const sanitized = input.replace(/[^0-9A-Za-z+/=]/g, "");
  if (sanitized.length === 0) return new Uint8Array();
  if (sanitized.length % 4 !== 0) throw new Error("无效的 Base64 字符串");
  let padding = 0;
  if (sanitized.endsWith("=")) padding += 1;
  if (sanitized.endsWith("==")) padding += 1;
  const outLen = (sanitized.length / 4) * 3 - padding;
  const out = new Uint8Array(outLen);
  let outIndex = 0;
  for (let i = 0; i < sanitized.length; i += 4) {
    const e1 = BASE64_ALPHABET.indexOf(sanitized[i]);
    const e2 = BASE64_ALPHABET.indexOf(sanitized[i + 1]);
    const e3 = sanitized[i + 2] === "=" ? 64 : BASE64_ALPHABET.indexOf(sanitized[i + 2]);
    const e4 = sanitized[i + 3] === "=" ? 64 : BASE64_ALPHABET.indexOf(sanitized[i + 3]);
    if (e1 < 0 || e2 < 0 || e3 < 0 || e4 < 0) {
      throw new Error("无效的 Base64 字符串");
    }
    const triple = (e1 << 18) | (e2 << 12) | ((e3 & 63) << 6) | (e4 & 63);
    out[outIndex++] = (triple >> 16) & 0xff;
    if (sanitized[i + 2] !== "=") {
      out[outIndex++] = (triple >> 8) & 0xff;
    }
    if (sanitized[i + 3] !== "=") {
      out[outIndex++] = triple & 0xff;
    }
  }
  return outIndex === outLen ? out : out.slice(0, outIndex);
}

function toUint8Array(data: BufferSource): Uint8Array {
  if (data instanceof Uint8Array) return data;
  if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
  return new Uint8Array(data);
}

function parseHex(text: string): Uint8Array {
  const normalized = text.trim().replace(/\s+/g, "");
  if (normalized.length % 2 !== 0) {
    throw new Error("无效的十六进制字符串");
  }
  const out = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    out[i / 2] = parseInt(normalized.substring(i, i + 2), 16);
  }
  return out;
}

function generateSocketId(): string {
  return `udp-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

function getNativeModule() {
  if (NativeUdpModule) {
    return NativeUdpModule;
  }
  const legacy = NativeModules?.Udp;
  if (legacy && typeof legacy.createSocket === "function") {
    return legacy as typeof NativeUdpModule;
  }
  throw new Error("react-native-udp 原生模块未就绪");
}

let sharedEmitter: NativeEventEmitter | null = null;

function ensureEmitter(): NativeEventEmitter {
  if (!sharedEmitter) {
    sharedEmitter = new NativeEventEmitter(getNativeModule() as never);
  }
  return sharedEmitter;
}

export type UdpEncoding = "utf8" | "base64" | "hex";

export interface UdpSocketConfig {
  socketId?: string;
  localAddress?: string;
  localPort?: number;
  reusePort?: boolean;
  reuseAddress?: boolean;
}

export interface UdpMessage {
  socketId: string;
  remoteAddress: string;
  remotePort: number;
  data: Uint8Array;
  dataText: string;
  length: number;
}

export interface UdpSocket {
  socketId: string;
  send(data: UdpPayload, host: string, port: number, options?: { encoding?: UdpEncoding }): Promise<void>;
  close(): Promise<void>;
  addListener(listener: (message: UdpMessage) => void): EmitterSubscription;
}

export type UdpPayload = string | BufferSource;

function encodePayload(payload: UdpPayload, encoding: UdpEncoding): string {
  if (payload instanceof Uint8Array || ArrayBuffer.isView(payload) || payload instanceof ArrayBuffer) {
    return encodeBase64(toUint8Array(payload));
  }
  if (encoding === "utf8") {
    return encodeBase64(encodeUtf8(payload));
  }
  if (encoding === "hex") {
    return encodeBase64(parseHex(payload));
  }
  if (encoding === "base64") {
    return payload;
  }
  throw new Error(`不支持的编码方式: ${encoding}`);
}

function transformEvent(event: NativeUdpMessageEvent): UdpMessage {
  const data = event.dataBase64 ? decodeBase64(event.dataBase64) : new Uint8Array();
  return {
    socketId: event.socketId,
    remoteAddress: event.remoteAddress,
    remotePort: event.remotePort,
    data,
    dataText: decodeUtf8(data),
    length: event.length,
  };
}

export async function createSocket(config?: UdpSocketConfig): Promise<UdpSocket> {
  const socketId = config?.socketId && config.socketId.length > 0 ? config.socketId : generateSocketId();
  const nativeConfig: NativeUdpSocketConfig = {
    socketId,
    localAddress: config?.localAddress,
    localPort: typeof config?.localPort === "number" ? config.localPort : undefined,
    reusePort: config?.reusePort,
    reuseAddress: config?.reuseAddress,
  };
  const id = await getNativeModule().createSocket(nativeConfig);
  const emitter = ensureEmitter();

  return {
    socketId: id,
    send: async (data: UdpPayload, host: string, port: number, options?: { encoding?: UdpEncoding }) => {
      const encoding = options?.encoding ?? (typeof data === "string" ? "utf8" : "utf8");
      const payloadBase64 = encodePayload(data, encoding);
      await getNativeModule().send(id, payloadBase64, host, port);
    },
    close: async () => {
      await getNativeModule().close(id);
    },
    addListener: (listener: (message: UdpMessage) => void): EmitterSubscription => {
      const subscription = emitter.addListener(EVENT_ON_MESSAGE, (raw: NativeUdpMessageEvent) => {
        if (!raw || raw.socketId !== id) return;
        listener(transformEvent(raw));
      });
      return subscription;
    },
  };
}

export async function send(
  socketId: string,
  data: UdpPayload,
  host: string,
  port: number,
  options?: { encoding?: UdpEncoding },
): Promise<void> {
  const encoding = options?.encoding ?? (typeof data === "string" ? "utf8" : "utf8");
  const payloadBase64 = encodePayload(data, encoding);
  await getNativeModule().send(socketId, payloadBase64, host, port);
}

export async function close(socketId: string): Promise<void> {
  await getNativeModule().close(socketId);
}

export async function closeAll(): Promise<void> {
  await getNativeModule().closeAll();
}

export function addMessageListener(listener: (message: UdpMessage) => void): EmitterSubscription {
  const emitter = ensureEmitter();
  return emitter.addListener(EVENT_ON_MESSAGE, (raw: NativeUdpMessageEvent) => {
    listener(transformEvent(raw));
  });
}

export const Udp = {
  createSocket,
  send,
  close,
  closeAll,
  addMessageListener,
};

export default Udp;
