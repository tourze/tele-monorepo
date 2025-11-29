// 类型定义（占位）
export type SSRStartConfig = {
  host: string;
  port: number;
  password?: string;
  method?: string;
  protocol?: string;
  protocolParam?: string;
  obfs?: string;
  obfsParam?: string;
  route?: string;
  udpdns?: boolean;
  lanOpen?: boolean;
  tunAddresses?: string[];
  tunRoutes?: string[];
  udpServers?: string[];
  udpListenIps?: string[];
  udpListenPorts?: number[];
  dns?: string;
  chinaDns?: string;
  ipv6?: boolean;
  allowedApps?: string[];
  disallowedApps?: string[];
  forceProxyHosts?: string[];
};

export function prepare(): Promise<boolean>;
export function start(config: SSRStartConfig): Promise<boolean>;
export function stop(): Promise<boolean>;
export function status(): Promise<string>;

declare const _default: {
  prepare: typeof prepare;
  start: typeof start;
  stop: typeof stop;
  status: typeof status;
};
export default _default;
