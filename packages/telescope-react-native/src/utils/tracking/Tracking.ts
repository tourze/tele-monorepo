import dayjs from 'dayjs';
import TsFifoArray from './TsFifoArray';
import formatData from './formatData';
// import getLocale from '../os/getLocale';
import reportProd from './reportProd';

const fifoArray = TsFifoArray(50, []);

const Tracking = {
  info: async (name: string, params: any = {}) => {
    const newParams = formatData({...params});
    //newParams.locale = await getLocale();

    if (__DEV__) {
      // 开发环境，我们只需要打印出来
      const time = dayjs().format();
      // 注意：这里打印经过格式化后的参数，包含可读的错误信息
      console.log('Tracking调试', time, name, newParams);
    } else {
      // 正式环境才上报
      await reportProd(name, newParams);
    }

    // @ts-ignore
    fifoArray.push({name, params: newParams});
  },

  getAll: () => {
    return fifoArray;
  },
};

export default Tracking;
