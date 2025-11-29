import { useEffect, useRef } from 'react';

const now = () => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
};

const useRenderBaseline = (label: string) => {
  const metricsRef = useRef({
    renderCount: 0,
    totalDuration: 0,
  });
  const renderStartRef = useRef<number>(0);

  if (__DEV__) {
    renderStartRef.current = now();
  }

  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    const endTime = now();
    const duration = endTime - renderStartRef.current;
    const metrics = metricsRef.current;
    metrics.renderCount += 1;
    metrics.totalDuration += duration;

    if (metrics.renderCount % 5 === 0) {
      const avg = metrics.totalDuration / metrics.renderCount;
      // eslint-disable-next-line no-console
      console.log('[RenderBaseline]', label, {
        renderCount: metrics.renderCount,
        lastDuration: duration.toFixed(2),
        averageDuration: avg.toFixed(2),
      });
    }

    return () => {
      renderStartRef.current = now();
    };
  });

  useEffect(() => {
    if (!__DEV__) {
      return;
    }
    return () => {
      const metrics = metricsRef.current;
      if (metrics.renderCount > 0) {
        const avg = metrics.totalDuration / metrics.renderCount;
        // eslint-disable-next-line no-console
        console.log('[RenderBaseline][Unmount]', label, {
          renderCount: metrics.renderCount,
          averageDuration: avg.toFixed(2),
        });
      }
    };
  }, [label]);
};

export default useRenderBaseline;
