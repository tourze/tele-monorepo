// TurboModule 声明：为 JS 层提供类型以及 codegen 入口
import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";
import type { Double } from "react-native/Libraries/Types/CodegenTypes";

export type NativeCurlHeader = {
  name: string;
  value: string;
};

export type NativeCurlRequest = {
  requestId?: string;
  url: string;
  method?: string;
  headers?: ReadonlyArray<NativeCurlHeader>;
  bodyBase64?: string;
  timeoutMs?: Double;
  connectTimeoutMs?: Double;
  followRedirects?: boolean;
  allowInsecure?: boolean;
  pinnedPublicKeys?: ReadonlyArray<string>;
  caCertPem?: string;
  ipOverride?: string;
  dnsServers?: ReadonlyArray<string>;
  httpVersion?: string;
  acceptEncoding?: string;
  maxRedirects?: Double;
};

export type NativeCurlTiming = {
  nameLookupMs?: Double;
  connectMs?: Double;
  appConnectMs?: Double;
  preTransferMs?: Double;
  startTransferMs?: Double;
  redirectMs?: Double;
  totalMs?: Double;
};

export type NativeCurlResponse = {
  requestId?: string;
  ok: boolean;
  status?: Double;
  statusText?: string;
  responseUrl?: string;
  headers?: ReadonlyArray<NativeCurlHeader>;
  bodyBase64?: string;
  errorCode?: string;
  errorMessage?: string;
  timing?: NativeCurlTiming;
};

export interface Spec extends TurboModule {
  performRequest(options: NativeCurlRequest): Promise<NativeCurlResponse>;
  cancelRequest(requestId: string): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: Double): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>("Curl");
