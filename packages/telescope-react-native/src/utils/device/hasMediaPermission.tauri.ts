async function hasMediaPermission__forWeb() {
  // web平台都是tauri在用，权限就默认当作有
  return true;
}

export default hasMediaPermission__forWeb;
