import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';

function GetStarHomePayChannel() {
  // GetStarHomePayChannel
  return callTsJsonRpcAPI('p859');
}

function useGetStarHomePayChannel() {
  const {data, loading, run, cancel} = useRequest(GetStarHomePayChannel, {
    retryCount: 5, // 重试5次
    cacheKey: 'GetStarHomePayChannel',
  });
  return {data, loading, run, cancel};
}

export {GetStarHomePayChannel, useGetStarHomePayChannel};
