// 该文件提供本地类型桩，避免在未安装 react-native 类型时出现 TS2307
// 仅用于编译期忽略，运行时无影响

declare const __DEV__: boolean;

// 对 react-native 包的最小声明
declare module "react-native" {
  interface NativeModulesShape {
    [key: string]: any;
    TcpPing?: {
      startPing?: (...args: any[]) => Promise<any>;
      startBatchPing?: (...args: any[]) => void;
      stopBatchPing?: (...args: any[]) => void;
    };
  }

  export const NativeModules: NativeModulesShape;

  // TurboModule 与 TurboModuleRegistry 在类型上不做强约束，使用 any 占位
  export type TurboModule = any;
  export const TurboModuleRegistry: {
    getEnforcing<T>(name: string): T;
  };

  // 事件订阅相关类型：仅保留 remove 方法即可满足当前用法
  export type EmitterSubscription = {
    remove: () => void;
  };

  // NativeEventEmitter 仅需 addListener/removeListeners 方法
  export class NativeEventEmitter {
    constructor(nativeModule?: any);
    addListener(
      eventType: string,
      listener: (...args: any[]) => void,
    ): EmitterSubscription;
    removeAllListeners(eventType?: string): void;
    removeSubscription(subscription: EmitterSubscription): void;
  }
}

// 对内部 CodegenTypes 提供最小声明
declare module "react-native/Libraries/Types/CodegenTypes" {
  export type Double = number;
}
