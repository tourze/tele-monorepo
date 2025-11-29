import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";
import type { Double } from "react-native/Libraries/Types/CodegenTypes";

export type NativeUdpSocketConfig = {
  socketId?: string;
  localAddress?: string;
  localPort?: Double;
  reusePort?: boolean;
  reuseAddress?: boolean;
};

export type NativeUdpMessageEvent = {
  socketId: string;
  remoteAddress: string;
  remotePort: Double;
  dataBase64: string;
  length: Double;
};

export interface Spec extends TurboModule {
  createSocket(config?: NativeUdpSocketConfig): Promise<string>;
  send(socketId: string, dataBase64: string, host: string, port: Double): Promise<void>;
  close(socketId: string): Promise<void>;
  closeAll(): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: Double): void;
}

// @ts-ignore
export default TurboModuleRegistry.getEnforcing<Spec>("Udp");
