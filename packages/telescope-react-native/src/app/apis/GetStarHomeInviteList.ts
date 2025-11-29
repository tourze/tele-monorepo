import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';

function GetStarHomeInviteList() {
  // GetStarHomeInviteList
  return callTsJsonRpcAPI('youneigui');
}

function useGetStarHomeInviteList() {
  const {data, loading, run, cancel} = useRequest(GetStarHomeInviteList, {
    retryCount: 5, // 重试5次
  });
  return {data, loading, run, cancel};
}

export {GetStarHomeInviteList, useGetStarHomeInviteList};
