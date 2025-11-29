import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';

function GetStarHomeAdList() {
  // GetStarHomeAdList
  return callTsJsonRpcAPI('UnknownException');
}

function useGetStarHomeAdList() {
  const {data, loading, run, cancel} = useRequest(GetStarHomeAdList, {
    retryCount: 5, // 重试5次
    cacheKey: 'GetStarHomeAdList',
  });
  return {data, loading, run, cancel};
}

export {GetStarHomeAdList, useGetStarHomeAdList};
