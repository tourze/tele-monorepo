async function getLogFileName(runAsRoot: boolean) {
  if (runAsRoot) {
    return 'sing-box-root.log';
  }
  return 'sing-box-common.log';
}

export default getLogFileName;
