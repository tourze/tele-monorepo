import startSingBox from '../sing-box/startSingBox';
import getPrivateRules from '../sing-box/getPrivateRules';
import getOutbounds from '../sing-box/getOutbounds';
import getGeoRoutes from '../sing-box/getGeoRoutes';
import getTunInbound from '../sing-box/getTunInbound';
import getSmartDns from '../sing-box/getSmartDns';
import getProcessRules from '../sing-box/getProcessRules';
import getDnsOutRules from '../sing-box/getDnsOutRules';
import getLogConfig from '../sing-box/getLogConfig';
import getLogLevel from '../sing-box/getLogLevel';

// 网卡模式 & 全局代理
async function startSingBoxGlobalTunService__MacOS(node: any) {
  console.log('startSingBoxGlobalHttpService__MacOS', node);

  const jsonData = {
    log: await getLogConfig(await getLogLevel(), true),
    dns: await getSmartDns(),
    inbounds: await getTunInbound(),
    outbounds: await getOutbounds(node),
    route: {
      final: 'proxy',
      ...(await getGeoRoutes()),
      auto_detect_interface: true,
      rules: [
        ...(await getDnsOutRules()),
        ...(await getProcessRules()),
        ...(await getPrivateRules()),
      ],
    },
    experimental: {},
  };
  return (await startSingBox(jsonData,  true)) > 0;
}

export default startSingBoxGlobalTunService__MacOS;
