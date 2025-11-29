import sendGetRequest from '../http/sendGetRequest';

// 加密函数
function encrypt(input: string) {
  const shift = 3;
  let encrypted = '';
  for (let i = 0; i < input.length; i++) {
    // 按字符移位
    encrypted += String.fromCharCode(input.charCodeAt(i) + shift);
  }
  // 反转字符串
  return encrypted.split('').reverse().join('');
}

// 解密函数
function decrypt(encrypted: string) {
  const shift = 3;
  // 先反转字符串
  const reversed = encrypted.split('').reverse().join('');
  let decrypted = '';
  for (let i = 0; i < reversed.length; i++) {
    // 按字符移位回去
    decrypted += String.fromCharCode(reversed.charCodeAt(i) - shift);
  }
  return decrypted;
}

/**
 * 根据传入的地址，我们尝试从内容中解析一些有用的地址出来
 *
 * @param urls
 */
export default async function fetchBackupDomains(urls: string[]) {
  // 正则表达式匹配格式为 #$#匹配内容#$#
  const regex = /#\$#(.*?)#\$#/;

  let allDomains: string[] = [];

  for (const url of urls) {
    try {
      // 发送请求获取内容
      const text = await sendGetRequest(url);
      if (text === null) {
        continue;
      }

      // 查找匹配内容
      const match = text.match(regex);

      if (match && match[1]) {
        // 提取的匹配内容
        const encryptedContent = match[1];

        // 解密
        const decryptedContent = decrypt(encryptedContent);

        // 按逗号分割解密后的内容为域名数组，并过滤掉空字符串
        const domains = decryptedContent
          .split(',')
          .filter(domain => domain.trim() !== '');

        // 将结果加入总域名数组
        allDomains = allDomains.concat(domains);
      }
    } catch (error) {
      console.error(`Error fetching or processing URL ${url}: `, error);
    }
  }

  return allDomains;
}
