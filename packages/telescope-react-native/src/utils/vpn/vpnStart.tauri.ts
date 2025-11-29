import vpnStop from './vpnStop';
import getStorageItem from '../storage/getStorageItem';
import startSingBoxGlobalHttpService__MacOS from './macos/startSingBoxGlobalHttpService__MacOS';
import startSingBoxSmartHttpService__MacOS from './macos/startSingBoxSmartHttpService__MacOS';
import startSingBoxSmartTunService__MacOS from './macos/startSingBoxSmartTunService__MacOS';
import startSingBoxGlobalTunService__MacOS from './macos/startSingBoxGlobalTunService__MacOS';
import hostToIp from '../network/hostToIp';

async function vpnStart_forWeb(node: any) {
  // 旧服务，总是需要关闭的
  await vpnStop();

  const newNode = {...node};

  // 使用场景 0网页 1网卡
  let ethMode = parseInt((await getStorageItem('ethMode')) as string, 10);
  if (isNaN(ethMode)) {
    ethMode = 0;
  }

  // 分流模式 0智能 1全局
  let proxyMode = parseInt((await getStorageItem('proxyMode')) as string, 10);
  if (isNaN(proxyMode)) {
    proxyMode = 0;
  }

  // 那总共4个组合
  console.log('vpnStart_forWeb', newNode, ethMode, proxyMode);

  if (ethMode === 0) {
    if (proxyMode === 0) {
      // 网页模式 & 智能分流
      return await startSingBoxSmartHttpService__MacOS(newNode);
    } else {
      // 网页模式 & 全局代理
      return await startSingBoxGlobalHttpService__MacOS(newNode);
    }
  } else {
    // 网卡模式下，我们最好传入的节点是IP形式而不是域名，以减少一些DNS问题
    newNode.ip = await hostToIp(newNode.ip);
    // 如果JS解析不到，最终就各个端自己解决了

    if (proxyMode === 0) {
      // 网卡模式 & 智能分流
      return await startSingBoxSmartTunService__MacOS(newNode);
    } else {
      // 网卡模式 & 全局代理
      return await startSingBoxGlobalTunService__MacOS(newNode);
    }
  }
}

export default vpnStart_forWeb;
