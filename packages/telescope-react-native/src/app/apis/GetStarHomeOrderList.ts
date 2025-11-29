import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';

function GetStarHomeOrderList() {
  // GetStarHomeOrderList
  return callTsJsonRpcAPI('WPSOffice');
}

function useGetStarHomeOrderList() {
  const {data, loading, run, cancel} = useRequest(GetStarHomeOrderList, {
    retryCount: 5, // 重试5次
  });
  return {data, loading, run, cancel};
}

export {GetStarHomeOrderList, useGetStarHomeOrderList};
