import React, { useMemo } from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import useStorage from '../../../hooks/useStorage';
import SpeedDisplay from '../../../components/SpeedDisplay';
import CatchError from '../../../components/CatchError';

interface NodeSpeedProps {
  ip?: string;
  port?: number;
}

function NodeSpeed({ ip = '', port = 0 }: NodeSpeedProps) {
  const storageKey = useMemo(() => {
    if (!ip || !port) {
      return '__speed-empty__';
    }
    return `speed-${ip}-${port}`;
  }, [ip, port]);

  const { data: speed } = useStorage(storageKey, undefined);

  return <SpeedDisplay speed={speed} />;
}

export default withErrorBoundary(NodeSpeed, {
  FallbackComponent: CatchError,
});
