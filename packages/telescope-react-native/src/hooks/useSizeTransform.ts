import { useCallback } from 'react';
import useWindowHeight from './useWindowWidth';

const BASE_WIN_WIDTH = 750;

export default function useSizeTransform() {
  const width = useWindowHeight();

  return useCallback(function (w: number) {
    return (width / BASE_WIN_WIDTH) * w;
  }, [width]);
}
