import startSingBox from '../sing-box/startSingBox';
import getPrivateRules from '../sing-box/getPrivateRules';
import getOutbounds from '../sing-box/getOutbounds';
import getGeoRoutes from '../sing-box/getGeoRoutes';
import getHttpInbound from '../sing-box/getHttpInbound';
import getSmartDns from '../sing-box/getSmartDns';
import getProcessRules from '../sing-box/getProcessRules';
import getLogConfig from '../sing-box/getLogConfig';
import getLogLevel from '../sing-box/getLogLevel';

// 网页模式 & 全局代理
async function startSingBoxGlobalHttpService__MacOS(node: any) {
  console.log('startSingBoxGlobalHttpService__MacOS', node);

  const jsonData = {
    log: await getLogConfig(await getLogLevel(), false),
    dns: await getSmartDns(),
    inbounds: await getHttpInbound(),
    outbounds: await getOutbounds(node),
    route: {
      final: 'proxy',
      ...(await getGeoRoutes()),
      auto_detect_interface: true,
      rules: [...(await getProcessRules()), ...(await getPrivateRules())],
    },
    experimental: {},
  };
  return (await startSingBox(jsonData, false)) > 0;
}

export default startSingBoxGlobalHttpService__MacOS;
