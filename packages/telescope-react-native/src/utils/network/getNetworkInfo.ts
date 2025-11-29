import NetInfo, {NetInfoState, NetInfoStateType} from '@react-native-community/netinfo';

export interface NetworkInfo {
  supportsIPv6: boolean;
}

let cachedInfo: NetworkInfo | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 30 * 1000;

function hasIpv6FromDetails(state: NetInfoState): boolean {
  const details: any = state.details;
  if (!details) {
    return false;
  }
  const ipv6Candidate =
    typeof details.ipv6Address === 'string' && details.ipv6Address.length > 0
      ? details.ipv6Address
      : typeof details.ipAddress === 'string'
        ? details.ipAddress
        : null;
  if (typeof ipv6Candidate === 'string' && ipv6Candidate.includes(':')) {
    return true;
  }
  return false;
}

async function resolveNetworkInfo(): Promise<NetworkInfo> {
  try {
    const state = await NetInfo.fetch();
    let supportsIPv6 = false;
    if (state.type === NetInfoStateType.unknown || state.type === NetInfoStateType.none) {
      supportsIPv6 = false;
    } else {
      supportsIPv6 = hasIpv6FromDetails(state);
    }
    return {supportsIPv6};
  } catch (error) {
    // 读取失败时保守返回 false
    return {supportsIPv6: false};
  }
}

export default async function getNetworkInfo(): Promise<NetworkInfo> {
  const now = Date.now();
  if (cachedInfo && now - cachedAt < CACHE_TTL_MS) {
    return cachedInfo;
  }
  const info = await resolveNetworkInfo();
  cachedInfo = info;
  cachedAt = now;
  return info;
}
