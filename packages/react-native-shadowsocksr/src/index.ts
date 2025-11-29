// JS 入口：优先使用新架构 TurboModule，其次回退旧架构 NativeModules
// 中文注释：此版本为占位实现，确保应用可编译与运行，后续替换为真实逻辑
import Native from "./NativeShadowsocksR";
import { NativeModules } from "react-native";

import type { SSRStartConfig } from "./NativeShadowsocksR";

export async function prepare(): Promise<boolean> {
  try {
    if (Native && typeof Native.prepare === "function") return await Native.prepare();
  } catch {}
  const legacy = (NativeModules as any)?.ShadowsocksR;
  if (legacy && typeof legacy.prepare === "function") return !!(await legacy.prepare());
  if (process.env.NODE_ENV !== "production") {
    console.warn("[react-native-shadowsocksr] 未找到原生实现，prepare() 返回 true(占位)");
  }
  return true;
}

export async function start(config: SSRStartConfig): Promise<boolean> {
  try {
    if (Native && typeof Native.start === "function") {
      return await Native.start(
        config.host,
        config.port,
        config.password,
        config.method,
        config.protocol,
        config.protocolParam,
        config.obfs,
        config.obfsParam,
        config.route,
        config.udpdns,
        config.tunAddresses ?? null,
        config.tunRoutes ?? null,
        config.udpServers ?? null,
        config.udpListenIps ?? null,
        config.udpListenPorts ?? null,
        config.lanOpen,
        config.dns,
        config.chinaDns,
        config.ipv6,
        config.allowedApps ?? null,
        config.disallowedApps ?? null,
        config.forceProxyHosts ?? null,
      );
    }
  } catch {}
  const legacy = (NativeModules as any)?.ShadowsocksR;
  if (legacy && typeof legacy.start === "function") return !!(await legacy.start(config));
  if (process.env.NODE_ENV !== "production") {
    console.warn("[react-native-shadowsocksr] 未找到原生实现，start() 返回 false(占位)");
  }
  return false;
}

export async function stop(): Promise<boolean> {
  try {
    if (Native && typeof Native.stop === "function") return await Native.stop();
  } catch {}
  const legacy = (NativeModules as any)?.ShadowsocksR;
  if (legacy && typeof legacy.stop === "function") return !!(await legacy.stop());
  if (process.env.NODE_ENV !== "production") {
    console.warn("[react-native-shadowsocksr] 未找到原生实现，stop() 返回 true(占位)");
  }
  return true;
}

export async function status(): Promise<string> {
  try {
    if (Native && typeof Native.status === "function") return await Native.status();
  } catch {}
  const legacy = (NativeModules as any)?.ShadowsocksR;
  if (legacy && typeof legacy.status === "function") return String(await legacy.status());
  return "UNKNOWN";
}

export default { prepare, start, stop, status };
