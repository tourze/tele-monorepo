import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';
import { useEffect } from 'react';

function GetDiyPageElementByCode(params = {}) {
  return callTsJsonRpcAPI('GetDiyPageElementByCode', params);
}

function useGetDiyPageElementByCode(params = {}) {
  const {data, loading, run, cancel} = useRequest(GetDiyPageElementByCode, {
    retryCount: 5, // 重试5次
    cacheKey: 'GetDiyPageElementByCode-' + JSON.stringify(params),
  });

  useEffect(() => {
    run(params);
  }, [JSON.stringify(params)]);

  return {data, loading, run, cancel};
}

export {GetDiyPageElementByCode, useGetDiyPageElementByCode};
