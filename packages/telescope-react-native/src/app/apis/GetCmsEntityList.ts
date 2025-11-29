import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';
import { useEffect } from 'react';

function GetCmsEntityList(params = {}) {
  return callTsJsonRpcAPI('GetCmsEntityList', params);
}

function useGetCmsEntityList(params = {}) {
  const {data, loading, run, cancel} = useRequest(GetCmsEntityList, {
    retryCount: 5, // 重试5次
    cacheKey: 'GetCmsEntityList-' + JSON.stringify(params),
  });

  useEffect(() => {
    run(params);
  }, [JSON.stringify(params)]);

  return {data, loading, run, cancel};
}

export {GetCmsEntityList, useGetCmsEntityList};
