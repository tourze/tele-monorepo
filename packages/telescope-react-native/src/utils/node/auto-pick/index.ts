import filterServersByCarrier from './filterServersByCarrier';
import filterServersByCountry from './filterServersByCountry';
import pickBestServer from './pickBestServer';

/**
 * 自动选择最佳节点
 * @param servers 服务器列表
 * @param userInfo 用户信息，用于判断是否为付费用户
 */
async function autoPickNode(servers: any[], userInfo?: any) {
  // 判断是否为付费用户
  const isPaidUser = userInfo?.paidUser === true;

  // 第一步：根据国家过滤，非付费用户只保留美日韩台新马泰的节点
  const { candidates: countryFiltered } = filterServersByCountry(servers, isPaidUser);

  // 第二步：根据运营商过滤
  const { candidates } = await filterServersByCarrier(countryFiltered);

  // 第三步：选择最佳节点
  return pickBestServer(candidates);
}

export default autoPickNode;
