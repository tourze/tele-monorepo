import uniq from 'lodash/uniq';
import executeCommand from '../shell/executeCommand';

async function queryDNS_forWin(host: string): Promise<string[]> {
  const result = await executeCommand('nslookup', ['-type=A', host]);
  return uniq(extractIPs(result));
}

function extractIPs(nslookupOutput: string): string[] {
  // 查找 'Addresses:' 后面的所有内容
  const addressesPart = nslookupOutput.split('Addresses: ')[1];
  if (!addressesPart) {
    return [];
  }

  // 仅从 'Addresses:' 开始的部分匹配IP地址
  const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
  const ips = addressesPart.match(ipRegex);
  return ips || [];
}

export default queryDNS_forWin;
