// Web 空实现：react-native-reanimated
// 提供最小占位导出，满足依赖库的 import，不做任何动画处理

export const Easing = {} as any;
export const Extrapolate = {} as any;
export const Layout = {} as any;
export const FadeIn = {} as any;
export const FadeOut = {} as any;
export const ZoomIn = {} as any;
export const ZoomOut = {} as any;
export const runOnUI = (fn: any) => fn;
export const useSharedValue = (_v?: any) => ({ value: _v });
export const useAnimatedStyle = (_fn?: any) => ({});
export const withTiming = (v: any) => v;
export const withSpring = (v: any) => v;
export const withDelay = (_t: number, v: any) => v;
export const cancelAnimation = (_v: any) => {};
export const interpolate = (v: any) => v;
export const useAnimatedGestureHandler = (_fn?: any) => (_e?: any) => {};
export const useDerivedValue = (fn: any) => fn();
export const useAnimatedProps = (_fn?: any) => ({});
export const useFrameCallback = (_fn?: any) => {};
export const measure = () => ({}) as any;
export const matchStyleSheet = () => ({} as any);
const Reanimated = {} as any;
export default Reanimated;

