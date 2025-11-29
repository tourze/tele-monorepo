import isCidr from "is-cidr";
import {isIP} from 'is-ip';
import uniq from 'lodash/uniq';
import memoize from 'lodash/memoize';
import { invoke } from '@tauri-apps/api/core';
import getStorageItem from '../../storage/getStorageItem';
import parseACL from '../parseACL';
import Tracking from '../../tracking/Tracking';

/**
 * 智能分流规则
 */
async function getSmartRules() {
  const aclFile = await getStorageItem('ACL_FILE');
  console.log('ACL_FILE', aclFile);

  // 如果有ACL File，那我们就按照ACL的规则来走，否则就返回默认的规则
  if (aclFile) {
    try {
      return generateAclRoutes(aclFile);
    } catch (e) {
      Tracking.info('ACL规则配置生成失败', {
        error: `${e}`,
        aclFile,
      });
    }
  }
  return await generateGeoRoutes();
}

const generateAclRoutes = memoize(async function(aclFile: string) {
  const aclText = `${await invoke('plugin:ttmanager|read_file_content', { path: aclFile })}`;
  const aclItems = parseACL(aclText);
  // console.log('aclItems', aclItems);

  // 如果有 proxy_all，意思是默认走代理，那我们只关注那些要pass的条目即可
  // if (aclItems.proxy_all !== undefined) {
  // }

  // 算了，后端是默认 proxy_all 的
  const result = [];

  if (aclItems.outbound_block_list !== undefined) {
    for (const item of getBlockList(aclItems.outbound_block_list, 'block')) {
      result.push(item);
    }
  }
  if (aclItems.bypass_list !== undefined) {
    for (const item of getBlockList(aclItems.bypass_list, 'direct')) {
      result.push(item);
    }
  }
  if (aclItems.proxy_list !== undefined) {
    for (const item of getBlockList(aclItems.proxy_list, 'proxy')) {
      result.push(item);
    }
  }

  return result;
});

function getBlockList(items: string[], outbound: string) {
  const result = [];

  const regexDomains = [];
  const cidrList = [];
  const domains = [];

  for (const item of items) {
    // 正则
    if (item.startsWith('(') || item.startsWith('^')) {
      regexDomains.push(item);
      continue;
    }
    // CIDR
    if (isCidr(item)) {
      cidrList.push(item);
      continue;
    }
    // 纯IP
    if (isIP(item)) {
      cidrList.push(`${item}/32`);
      continue;
    }
    // 其他情况，就当作域名处理了
    domains.push(item);
  }

  if (regexDomains.length > 0) {
    result.push({
      domain_regex: uniq(regexDomains),
      outbound
    });
  }
  if (cidrList.length > 0) {
    result.push({
      ip_cidr: uniq(cidrList),
      outbound
    });
  }
  if (domains.length > 0) {
    result.push({
      domain: uniq(domains),
      outbound
    });
  }

  return result;
}

/**
 * 基于geoip/geosite生成的规则
 */
async function generateGeoRoutes() {
  return [
    // 国内的域名和IP都直连
    {
      geosite: "cn",
      outbound: "direct"
    },
    {
      geoip: "cn",
      outbound: "direct"
    },
    {
      geoip: "private",
      outbound: "direct"
    },

    // 国外的域名和IP走代理
    {
      geosite: "geolocation-!cn",
      outbound: "proxy"
    },
    {
      geoip: "!cn",
      outbound: "proxy"
    },
  ];
}

export default getSmartRules;
