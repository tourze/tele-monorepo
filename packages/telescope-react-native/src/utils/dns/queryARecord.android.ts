import {resolveARecords} from './udpDnsResolver';

async function queryARecord__forAndroid(host: string): Promise<string[]> {
  return await resolveARecords(host);
}

export default queryARecord__forAndroid;
