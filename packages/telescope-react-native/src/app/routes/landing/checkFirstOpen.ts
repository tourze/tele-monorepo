import getStorageItem from '../../../utils/storage/getStorageItem';
import setStorageItem from '../../../utils/storage/setStorageItem';

async function checkFirstOpen() {
  try {
    const today = new Date().toISOString().slice(0, 10); // 获取当前日期 YYYY-MM-DD 格式
    const isFirstOpen = await getStorageItem('isFirstOpen'); // 从 AsyncStorage 中获取 isFirstOpen 值
    if (isFirstOpen !== today) {
      // 这是今天第一次打开应用
      // 在此处执行你需要的逻辑
      setStorageItem('isFirstOpen', today); // 将 isFirstOpen 设置为今天的日期
    } else {
      // 这不是今天第一次打开应用
      // 在此处执行其他操作
    }
  } catch (error) {
    console.log(error);
  }
}

export default checkFirstOpen;
