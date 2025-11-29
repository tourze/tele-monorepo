import {NativeModules} from 'react-native';
import SSR from 'react-native-shadowsocksr';
import sleep from '@anmiles/sleep';
import vpnStatus from './vpnStatus';
import Tracking from '../tracking/Tracking';

async function vpnStopAndroid() {
  let result;

  try {
    // 优先使用新模块
    result = await SSR.stop();
  } catch (error: any) {
    result = false;
  }
  if (!result) {
    Tracking.info('vpnStop时发生错误', {
      error,
    });
  }

  if (!result) {
    console.log('停止失败，我们在这里检查10次');
    let time = 1;
    while (time <= 10) {
      await sleep(500);
      console.log(`第${time}次检查进行中`);
      if (!(await vpnStatus())) {
        result = true;
        console.log(`第${time}次检查通过`);
        break;
      }
      time++;
    }
  }

  const {ProxyService} = NativeModules;

  try {
    ProxyService.stopProxyService();
  } catch (err) {
    Tracking.info('关闭HTTP代理失败', {
      err,
    });
  }

  try {
    ProxyService.stopUdpListeners();
  } catch (err) {
    Tracking.info('关闭UDP转发失败', {
      err,
    });
  }

  return result;
}

export default vpnStopAndroid;
