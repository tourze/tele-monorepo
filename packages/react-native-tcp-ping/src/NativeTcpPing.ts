// 新架构 TurboModule 声明（JS 端，用于 codegen）
import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";
import type { Double } from "react-native/Libraries/Types/CodegenTypes";

export type NativeBatchPingTarget = {
  host?: string;
  ip?: string;
  port: Double;
  count?: Double;
  timeoutMs?: Double;
  bypassVpn?: boolean;
};

export type NativeBatchPingOptions = {
  count?: Double;
  timeoutMs?: Double;
};

export interface Spec extends TurboModule {
  // 返回平均耗时（毫秒）；失败返回 null
  startPing(
    host: string,
    port: Double,
    count: Double,
    bypassVpn?: boolean,
  ): Promise<Double | null>;

  // 批量并行探测；结果通过事件返回
  startBatchPing(
    requestId: string,
    targets: ReadonlyArray<NativeBatchPingTarget>,
    options?: NativeBatchPingOptions,
  ): void;

  stopBatchPing(requestId: string): void;

  // 事件派发所需
  addListener(eventName: string): void;
  removeListeners(count: Double): void;
}

// 重要：默认导出必须为 getEnforcing<Spec>(moduleName)，以便 codegen 识别
// @ts-ignore
export default TurboModuleRegistry.getEnforcing<Spec>("TcpPing");
