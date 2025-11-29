import {useCallback} from 'react';

import {refresh, set} from '../../../../hooks/useStorage';
import getAllStorageKeys from '../../../../utils/storage/getAllStorageKeys';
import updateTsDomains from '../../../helpers/updateTsDomains';
import updateTsGfwList from '../../../helpers/updateTsGfwList';

/**
 * 后台更新 Hook
 *
 * 职责：
 * 1. 更新域名列表（防止下次打不开）
 * 2. 更新 GFW/ACL 规则
 * 3. 刷新所有存储键
 *
 * 优化：使用 Promise.allSettled 并行执行，不阻塞主流程导航（节省 500ms+）
 */
export const useBackgroundUpdates = (): {
  startBackgroundUpdates: () => void;
} => {
  const startBackgroundUpdates = useCallback((): void => {
    // 后台更新操作不阻塞主流程，全部异步执行
    Promise.allSettled([
      // 1. 更新域名
      set('DOMAIN_UPDATE', false).then(() =>
        updateTsDomains().then(() => set('DOMAIN_UPDATE', true))
      ),
      // 2. 更新ACL规则
      set('GFWLIST_UPDATE', false).then(() =>
        updateTsGfwList().then(() => set('GFWLIST_UPDATE', true))
      ),
      // 3. 同步并刷新所有key
      getAllStorageKeys().then(keys => {
        keys.map(refresh);
      }),
    ]).catch(() => {
      // 后台更新失败不影响主流程，静默处理
    });
  }, []);

  return {startBackgroundUpdates};
};
