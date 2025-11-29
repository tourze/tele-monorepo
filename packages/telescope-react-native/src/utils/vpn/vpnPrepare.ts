async function vpnPrepare(): Promise<boolean> {
  throw new Error('当前平台未实现代理授权，请检查平台专用实现');
}

export default vpnPrepare;
