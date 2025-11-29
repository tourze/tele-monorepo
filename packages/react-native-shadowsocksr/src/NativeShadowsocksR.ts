// 新架构 TurboModule 声明（JS 端，用于 codegen）
// 中文说明：此为 SSR 模块的对外接口定义，后续将由原生实现
import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";
import type { Double } from "react-native/Libraries/Types/CodegenTypes";

export type SSRStartConfig = {
  // 连接参数（最小集），后续将扩展为完整 Profile
  host: string;
  port: Double;
  password?: string;
  method?: string;
  protocol?: string;
  protocolParam?: string;
  obfs?: string;
  obfsParam?: string;
  // 路由/选项
  route?: string; // ALL / BYPASS_CHN / ACL / CHINALIST
  udpdns?: boolean;
  lanOpen?: boolean;
  tunAddresses?: string[];
  tunRoutes?: string[];
  udpServers?: string[];
  udpListenIps?: string[];
  udpListenPorts?: Array<Double>;
  dns?: string;
  chinaDns?: string;
  ipv6?: boolean;
  allowedApps?: string[];
  disallowedApps?: string[];
  forceProxyHosts?: string[];
};

export interface Spec extends TurboModule {
  // 触发授权或检查授权状态
  prepare(): Promise<boolean>;
  // 启动服务（占位：参数拆分，避免生成复杂结构体带来的跨端差异）
  start(
    host: string,
    port: Double,
    password?: string,
    method?: string,
    protocol?: string,
    protocolParam?: string,
    obfs?: string,
    obfsParam?: string,
    route?: string,
    udpdns?: boolean,
    tunAddresses?: Array<string> | null,
    tunRoutes?: Array<string> | null,
    udpServers?: Array<string> | null,
    udpListenIps?: Array<string> | null,
    udpListenPorts?: Array<Double> | null,
    lanOpen?: boolean,
    dns?: string,
    chinaDns?: string,
    ipv6?: boolean,
    allowedApps?: Array<string> | null,
    disallowedApps?: Array<string> | null,
    forceProxyHosts?: Array<string> | null,
  ): Promise<boolean>;
  // 停止服务
  stop(): Promise<boolean>;
  // 查询状态（占位：返回字符串）
  status(): Promise<string>;
}

// 默认导出必须为 getEnforcing<Spec>(moduleName)
export default TurboModuleRegistry.getEnforcing<Spec>("ShadowsocksR");
