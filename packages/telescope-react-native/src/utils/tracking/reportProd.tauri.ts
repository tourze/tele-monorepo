import {info} from '@tauri-apps/plugin-log';
import formatData from './formatData';

async function reportProd__forTauri(name: string, params: any = {}) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window.newrelic !== undefined && window.newrelic.info(name, {
      customAttributes: params,
    });
  } catch (err) {
  }

  // 写日志到本地
  await info(`${name} : ${JSON.stringify(formatData(params))}`);
}

export default reportProd__forTauri;
