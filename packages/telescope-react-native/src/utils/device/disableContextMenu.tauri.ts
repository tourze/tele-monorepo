async function disableContextMenu__forWeb() {
  if (__DEV__) {
    return false;
  }
  const body = document.body;
  body.oncontextmenu = function () {
    return false;
  };
  return true;
}

export default disableContextMenu__forWeb;
