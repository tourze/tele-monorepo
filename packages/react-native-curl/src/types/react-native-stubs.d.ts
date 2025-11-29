// 为在未安装 @types/react-native 的环境下提供最小类型声明

declare const __DEV__: boolean;

declare module "react-native" {
  export type TurboModule = any;

  interface NativeModulesShape {
    [key: string]: any;
    Curl?: {
      performRequest?: (...args: any[]) => Promise<any>;
      cancelRequest?: (...args: any[]) => Promise<any>;
    };
  }

  export const NativeModules: NativeModulesShape;

  export const TurboModuleRegistry: {
    getEnforcing<T>(name: string): T;
  };
}

declare module "react-native/Libraries/Types/CodegenTypes" {
  export type Double = number;
}
