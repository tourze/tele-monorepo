import {resolveARecords} from './udpDnsResolver';

async function queryARecord__forIOS(host: string): Promise<string[]> {
  return await resolveARecords(host);
}

export default queryARecord__forIOS;
