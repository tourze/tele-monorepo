import { useCallback, useEffect } from 'react';
import { useGetStarHomeRouteLines } from '../../../apis/GetStarHomeRouteLines';
import isEmpty from 'lodash/isEmpty';
import prePing from '../../../../utils/node/prePing';
import Tracking from '../../../../utils/tracking/Tracking';

const useHomePrecheck = () => {
  const { data: routeLines } = useGetStarHomeRouteLines();

  const preCheckNodes = useCallback(async () => {
    if (isEmpty(routeLines) || isEmpty(routeLines?.list)) {
      return;
    }
    const tasks = routeLines!.list.map(item =>
      prePing(item.ip, item.port, 1).catch(error => {
        Tracking.info('prePing时发生异常', {
          item,
          error: `${error}`,
        });
      }),
    );
    await Promise.all(tasks);
  }, [routeLines]);

  useEffect(() => {
    preCheckNodes();
  }, [preCheckNodes]);

  return {
    routeLines,
    preCheckNodes,
  };
};

export default useHomePrecheck;
