import { arch } from '@tauri-apps/plugin-os';
import { memoize } from 'lodash';

/**
 * 获取当前的CPU架构
 */
const getArch_forTauri = memoize(async (): Promise<string> => arch());

export default getArch_forTauri;
