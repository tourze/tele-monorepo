import { useEffect } from 'react';
import { useSafeState } from 'ahooks';
import { getCurrentWindow } from '@tauri-apps/api/window';

export default function useAppState__forTauri(): 'active' | 'background' | 'inactive' {
  const [appState, setAppState] = useSafeState<'active' | 'background' | 'inactive'>('active');

  useEffect(() => {
    const currentWindow = getCurrentWindow();

    // Define a function to handle window state changes
    const handleVisibilityChange = async () => {
      const isMinimized = await currentWindow.isMinimized();
      if (isMinimized) {
        setAppState('background');
      } else {
        const isFocused = await currentWindow.isFocused();
        setAppState(isFocused ? 'active' : 'inactive');
      }
    };

    // Listen to events and update state
    const unlistenMinimize = currentWindow.listen('tauri://minimize', handleVisibilityChange);
    const unlistenRestore = currentWindow.listen('tauri://restore', handleVisibilityChange);
    const unlistenFocus = currentWindow.listen('tauri://focus', () => setAppState('active'));
    const unlistenBlur = currentWindow.listen('tauri://blur', () => setAppState('inactive'));

    // Clean up the listeners when the component unmounts
    return () => {
      (async function() {
        // Await the unlisten functions to properly clean up
        const fn1 = await unlistenMinimize;
        fn1();
        const fn2 = await unlistenRestore;
        fn2();
        const fn3 = await unlistenFocus;
        fn3();
        const fn4 = await unlistenBlur;
        fn4();
      })();
    };
  }, [setAppState]);

  return appState;
}
