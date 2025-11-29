import { isError } from 'lodash';
import {formatError} from 'pretty-print-error';

function formatData(params: any) {
  // 遍历，如果发现是 Error 对象，那我们就格式化一次
  Object.keys(params).map(key => {
    const val = params[key];
    if (isError(val)) {
      params[key] = formatError(val);
    }
  });
  return params;
}

export default formatData;
