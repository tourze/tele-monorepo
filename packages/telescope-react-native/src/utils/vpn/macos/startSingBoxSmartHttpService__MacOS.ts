import startSingBox from '../sing-box/startSingBox';
import getPrivateRules from '../sing-box/getPrivateRules';
import getOutbounds from '../sing-box/getOutbounds';
import getGeoRoutes from '../sing-box/getGeoRoutes';
import getHttpInbound from '../sing-box/getHttpInbound';
import getSmartDns from '../sing-box/getSmartDns';
import getProcessRules from '../sing-box/getProcessRules';
import getSmartRules from '../sing-box/getSmartRules';
import getLogConfig from '../sing-box/getLogConfig';
import getLogLevel from '../sing-box/getLogLevel';

// 网页模式 & 智能分流
async function startSingBoxSmartHttpService__MacOS(node: any) {
  console.log('startSingBoxSmartHttpService__MacOS', node);

  const jsonData = {
    log: await getLogConfig(await getLogLevel(), false),
    dns: await getSmartDns(),
    inbounds: await getHttpInbound(),
    outbounds: await getOutbounds(node),
    route: {
      final: 'proxy',
      ...(await getGeoRoutes()),
      auto_detect_interface: true,
      rules: [
        ...(await getProcessRules()),
        ...(await getPrivateRules()),
        ...(await getSmartRules()),
      ],
    },
    experimental: {},
  };
  return (await startSingBox(jsonData, false)) > 0;
}

export default startSingBoxSmartHttpService__MacOS;
