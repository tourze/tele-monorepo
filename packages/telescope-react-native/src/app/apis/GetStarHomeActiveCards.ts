import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';

function GetStarHomeActiveCards() {
  // GetStarHomeActiveCards
  return callTsJsonRpcAPI('v8Throw');
}

function useGetStarHomeActiveCards() {
  const {data, loading, run, cancel} = useRequest(GetStarHomeActiveCards, {
    retryCount: 5, // 重试5次
  });
  return {data, loading, run, cancel};
}

export {GetStarHomeActiveCards, useGetStarHomeActiveCards};
