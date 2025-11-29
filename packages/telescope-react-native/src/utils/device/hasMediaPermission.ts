async function hasMediaPermission() {
  // 因为各个平台的实现都不一样，这里默认返回false
  return false;
}

export default hasMediaPermission;
