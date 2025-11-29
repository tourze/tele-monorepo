import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';

function GetStarHomeRouteLines() {
  // GetStarHomeRouteLines
  return callTsJsonRpcAPI('ECMASCRIPT');
}

function useGetStarHomeRouteLines() {
  const {data, loading, run, cancel, error, refresh} = useRequest(
    GetStarHomeRouteLines,
    {
      pollingInterval: 1000 * 30, // 30s轮训一次
      pollingWhenHidden: false,
      retryCount: 5, // 重试5次
      throttleWait: 1000 * 10, // 节流
      cacheKey: 'GetStarHomeRouteLines',
      cacheTime: 1000 * 60,
    },
  );

  return {data, loading, run, cancel, error, refresh};
}

export {GetStarHomeRouteLines, useGetStarHomeRouteLines};
