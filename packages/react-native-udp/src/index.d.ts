import type { NativeUdpMessageEvent, NativeUdpSocketConfig } from "./NativeUdp";

export type UdpEncoding = "utf8" | "base64" | "hex";

export type UdpPayload = string | ArrayBuffer | ArrayBufferView | Uint8Array;

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
  addListener(listener: (message: UdpMessage) => void): import("react-native").EmitterSubscription;
}

export declare function createSocket(config?: UdpSocketConfig): Promise<UdpSocket>;
export declare function send(
  socketId: string,
  data: UdpPayload,
  host: string,
  port: number,
  options?: { encoding?: UdpEncoding },
): Promise<void>;
export declare function close(socketId: string): Promise<void>;
export declare function closeAll(): Promise<void>;
export declare function addMessageListener(
  listener: (message: UdpMessage) => void,
): import("react-native").EmitterSubscription;

export declare const Udp: {
  createSocket: typeof createSocket;
  send: typeof send;
  close: typeof close;
  closeAll: typeof closeAll;
  addMessageListener: typeof addMessageListener;
};

export type { NativeUdpSocketConfig, NativeUdpMessageEvent };

export default Udp;
