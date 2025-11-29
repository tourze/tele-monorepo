import {useCallback} from 'react';

import {remove, set} from '../../../../hooks/useStorage';
import callTsJsonRpcAPI from '../../../helpers/callTsJsonRpcAPI';

/**
 * 远程配置同步 Hook
 *
 * 职责：
 * 1. 从远程 API 获取应用配置
 * 2. 处理渠道特殊配置项（以 :channelName 结尾的配置）
 * 3. 持久化配置到本地存储
 *
 * 优化：使用 reduce 单次遍历，减少 CPU 占用
 */
export const useRemoteConfig = (): {
  syncRemoteConfig: (channelName: string) => Promise<void>;
} => {
  const syncRemoteConfig = useCallback(async (channelName: string): Promise<void> => {
    try {
      // 1. 获取远程配置
      const res = await callTsJsonRpcAPI('main');

      // 2. 处理配置项（优化：单次遍历）
      const config = res.reduce((acc, item) => {
        const {name, value} = item;
        acc[name] = value;

        // 渠道的特殊值判断：如果名称以 :channelName 结尾，也创建不带后缀的副本
        if (name.endsWith(`:${channelName}`)) {
          const newName = name.replace(`:${channelName}`, '');
          acc[newName] = value;
        }

        return acc;
      }, {} as Record<string, unknown>);

      // eslint-disable-next-line no-console
      console.log('config', channelName, config);

      // 3. 持久化到本地
      await set('config', config);
    } catch (e) {
      // 配置获取失败，清除旧配置
      await remove('config');
    }
  }, []);

  return {syncRemoteConfig};
};
