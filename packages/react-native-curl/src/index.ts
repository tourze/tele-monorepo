import { NativeModules } from "react-native";
import NativeCurlModule, { type NativeCurlHeader, type NativeCurlRequest } from "./NativeCurl";

type BufferSource = ArrayBuffer | ArrayBufferView | Uint8Array;
type HeaderTuple = [string, string];
type HeaderRecord = Record<string, string | number | boolean | undefined>;
type HeadersInit = HeaderTuple[] | Map<string | number, string | number | boolean> | HeaderRecord;

function hasTextEncoder(): boolean {
  return typeof globalThis.TextEncoder !== "undefined";
}

function hasTextDecoder(): boolean {
  return typeof globalThis.TextDecoder !== "undefined";
}

function encodeUtf8(input: string): Uint8Array {
  if (hasTextEncoder()) {
    return new TextEncoder().encode(input);
  }
  const codePoints: number[] = [];
  for (let i = 0; i < input.length; i += 1) {
    let code = input.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff && i + 1 < input.length) {
      const next = input.charCodeAt(i + 1);
      if (next >= 0xdc00 && next <= 0xdfff) {
        code = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
        i += 1;
      }
    }
    if (code < 0x80) {
      codePoints.push(code);
    } else if (code < 0x800) {
      codePoints.push(0xc0 | (code >> 6));
      codePoints.push(0x80 | (code & 0x3f));
    } else if (code < 0x10000) {
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

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function encodeBase64(data: Uint8Array): string {
  const len = data.length;
  let output = "";
  let i = 0;
  for (; i + 2 < len; i += 3) {
    const chunk = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    output +=
      BASE64_ALPHABET[(chunk >> 18) & 0x3f] +
      BASE64_ALPHABET[(chunk >> 12) & 0x3f] +
      BASE64_ALPHABET[(chunk >> 6) & 0x3f] +
      BASE64_ALPHABET[chunk & 0x3f];
  }
  if (i < len) {
    const rem = len - i;
    const chunk = (data[i] << 16) | ((rem > 1 ? data[i + 1] : 0) << 8);
    output += BASE64_ALPHABET[(chunk >> 18) & 0x3f];
    output += BASE64_ALPHABET[(chunk >> 12) & 0x3f];
    output += rem > 1 ? BASE64_ALPHABET[(chunk >> 6) & 0x3f] : "=";
    output += "=";
  }
  return output;
}

function decodeBase64(input: string): Uint8Array {
  const sanitized = input.replace(/[^A-Za-z0-9+/=]/g, "");
  const len = sanitized.length;
  if (len % 4 !== 0) {
    throw new Error("无效的 Base64 字符串");
  }
  const tailOne = sanitized.charAt(len - 1) === "=";
  const tailTwo = sanitized.charAt(len - 2) === "=";
  const outputLength = (len / 4) * 3 - (tailOne ? 1 : 0) - (tailTwo ? 1 : 0);
  const output = new Uint8Array(outputLength);
  let o = 0;
  for (let i = 0; i < len; i += 4) {
    const enc1 = BASE64_ALPHABET.indexOf(sanitized[i]);
    const enc2 = BASE64_ALPHABET.indexOf(sanitized[i + 1]);
    if (enc1 < 0 || enc2 < 0) {
      throw new Error("无效的 Base64 字符串");
    }
    const enc3 = sanitized[i + 2] === "=" ? 64 : BASE64_ALPHABET.indexOf(sanitized[i + 2]);
    const enc4 = sanitized[i + 3] === "=" ? 64 : BASE64_ALPHABET.indexOf(sanitized[i + 3]);
    if ((sanitized[i + 2] !== "=" && enc3 < 0) || (sanitized[i + 3] !== "=" && enc4 < 0)) {
      throw new Error("无效的 Base64 字符串");
    }
    const chunk = (enc1 << 18) | (enc2 << 12) | ((enc3 & 63) << 6) | (enc4 & 63);
    output[o++] = (chunk >> 16) & 0xff;
    if (enc3 !== 64) {
      output[o++] = (chunk >> 8) & 0xff;
    }
    if (enc4 !== 64) {
      output[o++] = chunk & 0xff;
    }
  }
  return output;
}

function decodeUtf8(bytes: Uint8Array): string {
  if (hasTextDecoder()) {
    return new TextDecoder().decode(bytes);
  }
  let result = "";
  let i = 0;
  while (i < bytes.length) {
    const byte1 = bytes[i++];
    if ((byte1 & 0x80) === 0) {
      result += String.fromCharCode(byte1);
      continue;
    }
    if ((byte1 & 0xe0) === 0xc0) {
      const byte2 = bytes[i++] & 0x3f;
      const code = ((byte1 & 0x1f) << 6) | byte2;
      result += String.fromCharCode(code);
      continue;
    }
    if ((byte1 & 0xf0) === 0xe0) {
      const byte2 = bytes[i++] & 0x3f;
      const byte3 = bytes[i++] & 0x3f;
      const code = ((byte1 & 0x0f) << 12) | (byte2 << 6) | byte3;
      result += String.fromCharCode(code);
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

function normalizeBufferSource(input: BufferSource): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  return new Uint8Array(input);
}

function toBase64(body: CurlRequestBody | undefined, encoding: BodyEncoding): string | undefined {
  if (body == null) {return undefined;}
  if (typeof body === "string") {
    const bytes = encoding === "base64" ? decodeBase64(body) : encodeUtf8(body);
    return encodeBase64(bytes);
  }
  const bytes = normalizeBufferSource(body);
  return encodeBase64(bytes);
}

function buildHeaderArray(headers?: HeadersInit): NativeCurlHeader[] | undefined {
  if (!headers) {return undefined;}
  const out: NativeCurlHeader[] = [];
  if (Array.isArray(headers)) {
    headers.forEach(([name, value]) => {
      if (!name) {return;}
      out.push({ name: String(name), value: String(value ?? "") });
    });
    return out;
  }
  if (headers instanceof Map) {
    headers.forEach((value, key) => {
      out.push({ name: String(key), value: String(value ?? "") });
    });
    return out;
  }
  const entries = headers as HeaderRecord;
  Object.keys(entries).forEach((key) => {
    const value = entries[key];
    if (value == null) {return;}
    out.push({ name: key, value: String(value) });
  });
  return out;
}

function getNativeModule() {
  if (NativeCurlModule) {return NativeCurlModule;}
  const legacy = NativeModules?.Curl;
  if (legacy && typeof legacy.performRequest === "function") {
    return legacy as typeof NativeCurlModule;
  }
  throw new Error("react-native-curl 原生模块未正确链接");
}

function generateRequestId(): string {
  return `curl-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export type BodyEncoding = "utf8" | "base64";

export interface CurlRequestOptions {
  url: string;
  method?: string;
  headers?: HeadersInit;
  body?: CurlRequestBody;
  bodyEncoding?: BodyEncoding;
  timeoutMs?: number;
  connectTimeoutMs?: number;
  followRedirects?: boolean;
  allowInsecure?: boolean;
  pinnedPublicKeys?: string[];
  caCertPem?: string;
  ipOverride?: string;
  dnsServers?: string[];
  httpVersion?: "default" | "http1" | "http2";
  acceptEncoding?: string;
  maxRedirects?: number;
  requestId?: string;
}

export type CurlRequestBody = string | BufferSource;

export interface CurlResponse {
  status: number;
  ok: boolean;
  headers: Record<string, string>;
  url: string;
  statusText?: string;
  body?: Uint8Array;
  bodyText?: string;
  timing?: {
    nameLookupMs?: number;
    connectMs?: number;
    appConnectMs?: number;
    preTransferMs?: number;
    startTransferMs?: number;
    redirectMs?: number;
    totalMs?: number;
  };
  error?: {
    code?: string;
    message?: string;
  };
}

function normalizeNativeRequest(options: CurlRequestOptions): NativeCurlRequest {
  const requestId = options.requestId && options.requestId.length > 0 ? options.requestId : generateRequestId();
  const headers = buildHeaderArray(options.headers);
  const bodyBase64 = toBase64(options.body, options.bodyEncoding ?? "utf8");
  const httpVersion =
    options.httpVersion === "http1"
      ? "http1.1"
      : options.httpVersion === "http2"
        ? "http2"
        : undefined;
  return {
    requestId,
    url: options.url,
    method: options.method,
    headers,
    bodyBase64,
    timeoutMs: options.timeoutMs,
    connectTimeoutMs: options.connectTimeoutMs,
    followRedirects: options.followRedirects,
    allowInsecure: options.allowInsecure,
    pinnedPublicKeys: options.pinnedPublicKeys,
    caCertPem: options.caCertPem,
    ipOverride: options.ipOverride,
    dnsServers: options.dnsServers,
    httpVersion,
    acceptEncoding: options.acceptEncoding,
    maxRedirects: options.maxRedirects,
  };
}

function headersArrayToRecord(headers?: NativeCurlHeader[]): Record<string, string> {
  const record: Record<string, string> = {};
  if (!headers) {return record;}
  headers.forEach((header) => {
    if (!header || !header.name) {return;}
    const value = header.value ?? "";
    const key = header.name.toLowerCase();
    if (record[key]) {
      record[key] = `${record[key]}, ${value}`;
    } else {
      record[key] = value;
    }
  });
  return record;
}

function decodeBody(base64?: string): Uint8Array | undefined {
  if (!base64 || base64.length === 0) {return undefined;}
  return decodeBase64(base64);
}

export async function request(options: CurlRequestOptions): Promise<CurlResponse> {
  const nativeRequest = normalizeNativeRequest(options);
  const nativeModule = getNativeModule();
  const raw = await nativeModule.performRequest(nativeRequest);
  const headers = headersArrayToRecord(raw.headers as NativeCurlHeader[] | undefined);
  const body = decodeBody(raw.bodyBase64);
  const status = raw.status ?? 0;
  const ok = Boolean(raw.ok ?? (status >= 200 && status < 300));

  return {
    status,
    ok,
    headers,
    url: raw.responseUrl ?? options.url,
    statusText: raw.statusText ?? undefined,
    body,
    timing: raw.timing
      ? {
          nameLookupMs: raw.timing.nameLookupMs ?? undefined,
          connectMs: raw.timing.connectMs ?? undefined,
          appConnectMs: raw.timing.appConnectMs ?? undefined,
          preTransferMs: raw.timing.preTransferMs ?? undefined,
          startTransferMs: raw.timing.startTransferMs ?? undefined,
          redirectMs: raw.timing.redirectMs ?? undefined,
          totalMs: raw.timing.totalMs ?? undefined,
        }
      : undefined,
    error:
      raw.ok || !raw.errorCode
        ? undefined
        : {
            code: raw.errorCode ?? undefined,
            message: raw.errorMessage ?? undefined,
          },
    bodyText: body ? decodeUtf8(body) : undefined,
  };
}

export async function cancelRequest(requestId: string): Promise<void> {
  if (!requestId) {return;}
  try {
    await getNativeModule().cancelRequest(requestId);
  } catch (error) {
    if (__DEV__) {
      console.warn(`[react-native-curl] 取消请求失败: ${(error as Error).message}`);
    }
  }
}

export const Curl = {
  request,
  cancelRequest,
};

export default Curl;
