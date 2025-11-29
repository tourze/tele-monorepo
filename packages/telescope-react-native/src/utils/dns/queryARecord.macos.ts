import uniq from 'lodash/uniq';
import executeCommand from '../shell/executeCommand';

async function queryDNS_forMacOS(host: string): Promise<string[]> {
  return uniq((await executeCommand('dig', ['+short', host, 'A'])).split('\n'));
}

export default queryDNS_forMacOS;
