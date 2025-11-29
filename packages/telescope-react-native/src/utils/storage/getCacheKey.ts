// import getBundleId from '../app/getBundleId';

async function getCacheKey(key: string): Promise<string> {
  // TODO 因为还有旧版本要兼容，所以不能直接上。。
  return key;
  // const id = await getBundleId();
  // // 所有key都加上前缀，方便我们清除
  // return `${id}-${key}`;
}

export default getCacheKey;
