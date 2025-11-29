import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';

function GetStarHomePackageList() {
  // GetStarHomePackageList
  return callTsJsonRpcAPI('xxqg');
}

function useGetStarHomePackageList() {
  const {data, loading, run, cancel} = useRequest(GetStarHomePackageList, {
    retryCount: 5, // 重试5次
    cacheKey: 'GetStarHomePackageList',
  });
  return {data, loading, run, cancel};
}

export {GetStarHomePackageList, useGetStarHomePackageList};
