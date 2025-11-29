
// 禁止右键菜单
document.addEventListener('contextmenu', e => {
  e.preventDefault();
  return false;
}, { capture: true });

// 禁止选择
document.addEventListener('selectstart', e => {
  e.preventDefault();
  return false;
}, { capture: true });
