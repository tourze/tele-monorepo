import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';
import { useEffect } from 'react';

function GetCmsCategoryDetail(params = {}) {
  return callTsJsonRpcAPI('GetCmsCategoryDetail', params);
}

function useGetCmsCategoryDetail(params = {}) {
  const {data, loading, run, cancel} = useRequest(GetCmsCategoryDetail, {
    retryCount: 5, // 重试5次
    cacheKey: 'GetCmsCategoryDetail-' + JSON.stringify(params),
  });

  useEffect(() => {
    run(params);
  }, [JSON.stringify(params)]);

  return {data, loading, run, cancel};
}

export {GetCmsCategoryDetail, useGetCmsCategoryDetail};
