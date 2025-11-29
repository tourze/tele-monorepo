// 解析ACL文件的JavaScript代码
const parseACL = (aclContent: string) => {
  const sectionPattern = /\[(.*?)\]/g;
  let match;
  const acl: any = {};

  while ((match = sectionPattern.exec(aclContent)) !== null) {
    const title = match[1];
    const startIndex = match.index + match[0].length;
    const endIndex = aclContent.indexOf('[', startIndex);
    const sectionContent = aclContent.slice(startIndex, endIndex === -1 ? undefined : endIndex).trim();
    acl[title] = sectionContent.split('\n').filter(line => line.trim() !== '');
  }

  return acl;
};

export default parseACL;
