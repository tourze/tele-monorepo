import {NativeModules} from 'react-native';
import SSR from 'react-native-shadowsocksr';
import sleep from '@anmiles/sleep';
import { uniq, trim } from 'lodash';
import {get} from '../../hooks/useStorage';
import vpnStatus from './vpnStatus';
import hostToIp from '../network/hostToIp';
import Tracking from '../tracking/Tracking';

function removeDuplicateLines(text: string): string {
  const lines = text.split('\n');
  const uniqueLines = uniq(lines);
  return uniqueLines.join('\n');
}

const listOrUndefined = <T>(value?: T[]): T[] | undefined =>
  Array.isArray(value) && value.length > 0 ? value : undefined;

async function vpnStartAndroid(node: any) {
  const newNode = {...node};

  newNode.ip = await hostToIp(newNode.ip);
  // 如果JS解析不到，最终就各个端自己解决了

  // 是否开启udp，要在这里控制
  newNode.udpRelay = !!(await get('udpRelay', false));

  // 局域网支持
  newNode.lanOpen = !!(await get('lanOpen', false));

  // 0网页 1网卡，一般只有PC才会关心这个
  newNode.ethMode = parseInt(await get('ethMode', 0), 10);

  // 0智能 1全局
  const proxyMode = parseInt(await get('proxyMode', 0), 10);
  newNode.proxyMode = proxyMode;
  if (proxyMode === 0 || proxyMode === null) {
    // 智能模式
    newNode.route = 'default-server';
  }
  if (proxyMode === 1) {
    // 全局模式
    newNode.route = 'all';
  }

  // 自定义IP地址
  const customTunAddresses: string = await get('customTunAddresses', '');
  if (customTunAddresses.length > 0) {
    const ipList: any = [];
    removeDuplicateLines(customTunAddresses)
      .split('\n')
      .map(ip => {
        // 检查是否合法
        ip = ip.trim();
        if (ip.length === 0) {
          return;
        }
        if (!ip.includes('/')) {
          return;
        }
        ipList.push(ip);
      });
    newNode.tunAddresses = ipList;
  }

  // TODO 下面暂时没怎么用到
  const customTunRoutes: string = trim(await get('customTunRoutes', ''));
  if (customTunRoutes.length > 0) {
    const ipList: any = [];
    customTunRoutes.split('\n').map(ip => {
      // 检查是否合法
      ip = ip.trim();
      if (ip.length === 0) {
        return;
      }
      if (!ip.includes('/')) {
        return;
      }
      ipList.push(ip);
    });
    newNode.tunRoutes = ipList;
  }

  // UDP监听服务
  const udpBindAddress: string[] = [];
  (await get('udpBindAddress', '')).split('\n').map((ip: string) => {
    ip = ip.trim();
    if (ip.length === 0) {
      return;
    }
    udpBindAddress.push(ip);
  });
  newNode.udpListenIps = udpBindAddress;

  const udpBindPort: number[] = [];
  (await get('udpBindPort', '')).split('\n').map((port: string) => {
    port = port.trim();
    if (port.length === 0) {
      return;
    }
    udpBindPort.push(parseInt(port, 10));
  });
  newNode.udpListenPorts = udpBindPort;

  // 需要实现的UDP服务
  const udpServers: string = trim(await get('udpServers', ''));
  if (udpServers.length > 0) {
    newNode.udpServers = removeDuplicateLines(udpServers).split('\n');
  }

  // 需要强制走代理的域名
  const defaultForceProxyHosts = [
    'google.com',
    'www.google.com',
    'clients.google.com',
    'clients4.google.com',
    'mtalk.google.com',
    'gstatic.com',
    'github.com',
    'raw.githubusercontent.com',
    'assets-cdn.github.com',
    'codeload.github.com',
    'ip.sb',
    'api.ip.sb',
    'api.ip.cc',
    'ip-api.com',
  ];
  const forceProxyRaw: string = await get('vpnForceProxyHosts', defaultForceProxyHosts.join('\n'));
  const forceProxyHosts = removeDuplicateLines(forceProxyRaw)
    .split('\n')
    .map(host => host.trim())
    .filter(host => host.length > 0);
  if (forceProxyHosts.length > 0) {
    newNode.forceProxyHosts = forceProxyHosts;
  }

  // 需要排除的包名列表，默认包含宿主自身
  const bypassPackageRaw: string = await get('vpnBypassPackages', '');
  const bypassPackages = removeDuplicateLines(bypassPackageRaw)
    .split('\n')
    .map(pkg => pkg.trim())
    .filter(pkg => pkg.length > 0);
  if (bypassPackages.length === 0) {
    bypassPackages.push('com.telescope.pro');
  }
  newNode.disallowedApps = bypassPackages;

  // 有些情况下，我们需要把所有流量打到我们的测试服务器
  const fixedServerIp: string = await get('fixedServerIp', '');
  if (fixedServerIp.length > 0) {
    newNode.ip = fixedServerIp;
  }
  const fixedServerPort: string = await get('fixedServerPort', '');
  if (fixedServerPort.length > 0) {
    newNode.port = parseInt(fixedServerPort, 10);
  }

  // TODO 应用模式，只有部分应用走代理

  // 有可能连接了，但是还在等待成功返回
  console.log('最终传入', newNode);
  // 统一走新模块：先申请 VPN 权限，再启动
  let result = false;
  try {
    await SSR.prepare();
    Tracking.info('AndroidVPN-准备阶段', {
      message: '已触发系统VPN授权检查，若首次连接请确认弹窗',
    });
  } catch {}
  try {
    // 注意：后端节点字段为 `passwd`，此前误用 `password` 会导致认证失败
    result = await SSR.start({
      host: newNode.ip,
      port: newNode.port,
      password: newNode.passwd ?? newNode.password, // 兼容两种命名
      method: newNode.method,
      protocol: newNode.protocol,
      protocolParam: newNode.protoparam ?? newNode.protocolParam,
      obfs: newNode.obfs,
      obfsParam: newNode.obfsparam ?? newNode.obfsParam,
      route: newNode.route,
      udpdns: !!newNode.udpRelay,
      tunAddresses: listOrUndefined(newNode.tunAddresses),
      tunRoutes: listOrUndefined(newNode.tunRoutes),
      udpServers: listOrUndefined(newNode.udpServers),
      udpListenIps: listOrUndefined(newNode.udpListenIps),
      udpListenPorts: listOrUndefined(newNode.udpListenPorts),
      lanOpen: !!newNode.lanOpen,
      dns: newNode.dns,
      chinaDns: newNode.china_dns ?? newNode.chinaDns,
      ipv6: !!newNode.ipv6,
      allowedApps: listOrUndefined(newNode.allowedApps),
      disallowedApps: listOrUndefined(newNode.disallowedApps),
      forceProxyHosts: listOrUndefined(newNode.forceProxyHosts),
    });
  } catch (e) {
    result = false;
  }

  if (!result) {
    console.log('连接有时候需要等待连接，我们在这里检查20次');
    Tracking.info('AndroidVPN-等待授权或连接完成', {
      message: '初次启动返回false，开始轮询VPN状态',
    });
    let time = 1;
    while (time <= 20) {
      await sleep(1000);
      Tracking.info(`第${time}次检查进行中`, {
        ...newNode,
      });
      if (await vpnStatus()) {
        result = true;
        Tracking.info(`第${time}次检查通过`, {
          ...newNode,
        });
        break;
      }
      time++;
    }
  }

  // 开启HTTP端口
  const httpProxyOpen = !!(await get('httpProxyOpen', false));
  if (httpProxyOpen) {
    try {
      const {ProxyService} = NativeModules;
      ProxyService.startProxyService();
    } catch (err) {
      Tracking.info('开启HTTP代理失败', {
        err,
      });
    }
  }

  console.log('VPN连接结果', result);
  return result;
}

export default vpnStartAndroid;
