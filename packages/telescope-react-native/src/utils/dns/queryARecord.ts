/**
 * 查询并返回所有可能的解析结果
 *
 * @param host
 */
async function queryARecord(host: string): Promise<string[]> {
  console.warn('未实现queryDNS方法', host);
  return [];
}

export default queryARecord;
