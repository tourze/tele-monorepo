let defaultApiDomains = [
  'https://www.baidu.com'
];

function getDefaultApiDomains() {
  return defaultApiDomains;
}

function setDefaultApiDomains(apiDomains: string[]) {
  defaultApiDomains = apiDomains;
}

export {
  getDefaultApiDomains,
  setDefaultApiDomains,
};
