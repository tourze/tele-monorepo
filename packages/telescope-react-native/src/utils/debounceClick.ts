import debounce from 'lodash/debounce';

function debounceClick(func: any, timeout = 500) {
  return debounce(func, timeout, {leading: true, trailing: false});
}

export default debounceClick;
