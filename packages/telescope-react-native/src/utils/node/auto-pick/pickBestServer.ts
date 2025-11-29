import Tracking from '../../tracking/Tracking';
import hostToIp from '../../network/hostToIp';
import startPing from '../startPing';
import { getCacheVal } from '../prePing';

const maxOkCount = 15;

/**
 * 针对给定线路列表计算权重并返回得分最高的节点
 */
async function pickBestServer(servers: any[]) {
  if (servers.length === 0) {
    throw new Error('当前可用服务器列表为空');
  }

  let index = -1;
  let maxWeight = 0;
  let okCount = 0;

  for (let i = 0; i < servers.length; i++) {
    const item = servers[i];
    let currentWeight = 0;

    const host = item.ip;
    const ip = await hostToIp(item.ip);
    if (ip === null) {
      continue;
    }

    let delay: number | null = await getCacheVal(ip, item.port);
    if (delay === null) {
      try {
        delay = await startPing(ip, item.port, 1);
      } catch (error: any) {
        Tracking.info('ping节点时发生异常', {
          id: item.id,
          error,
        });
      }
    }

    if (delay === null) {
      continue;
    }

    const delayScore = delay > 300 || delay < 0 ? 0 : (40 * (300.0 - delay)) / 300.0;
    currentWeight = delayScore;

    if (item.online > 300) {
      continue;
    }
    if (item.online > 50) {
      currentWeight = currentWeight / 2;
    }
    if (item.online > 100) {
      currentWeight = currentWeight / 2;
    }

    Tracking.info('计算节点得分', {
      id: item.id,
      host,
      ip,
      port: item.port,
      weight: currentWeight,
      delayScore,
      delay,
      online: item.online,
    });

    if (i === 0) {
      index = 0;
      maxWeight = currentWeight;
    } else if (currentWeight > maxWeight) {
      index = i;
      maxWeight = currentWeight;
    }

    if (okCount >= maxOkCount) {
      break;
    }
    okCount++;
  }

  if (index >= 0) {
    return servers[index];
  }
  return null;
}

export default pickBestServer;
