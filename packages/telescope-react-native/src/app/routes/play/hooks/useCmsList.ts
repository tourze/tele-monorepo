import { useMemo } from 'react';
import { useGetCmsEntityList } from '../../../apis/GetCmsEntityList';

type UseCmsListParams = {
  modelCode: string;
} & Record<string, any>;

type UseCmsListOptions<T> = {
  selector?: (list: any[]) => T[];
};

/**
 * 统一封装 CMS 列表拉取逻辑，并对列表结果做 memo 缓存
 */
function useCmsList<T = any>(
  params: UseCmsListParams,
  options: UseCmsListOptions<T> = {},
) {
  const { selector } = options;
  const { data, loading, run, cancel } = useGetCmsEntityList(params);

  const list = useMemo(() => {
    const rawList = Array.isArray(data?.list) ? (data?.list as any[]) : [];
    if (selector) {
      try {
        return selector(rawList);
      } catch (e) {
        return rawList as unknown as T[];
      }
    }
    return rawList as unknown as T[];
  }, [data, selector]);

  return {
    list,
    data,
    loading,
    run,
    cancel,
  };
}

export default useCmsList;
