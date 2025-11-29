import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSafeState } from 'ahooks';

export default function useAppState(): AppStateStatus {
  const currentState = AppState.currentState;
  const [appState, setAppState] = useSafeState<AppStateStatus>(currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (newState: AppStateStatus) => {
      setAppState(newState);
    });

    // 清理函数确保事件移除
    return () => {
      subscription.remove();
    };
  }, []);  // 空数组意味着只在组件挂载和卸载时运行一次

  return appState;
}
