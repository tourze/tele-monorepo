import {useWindowDimensions} from 'react-native';

/**
 * 这里返回的高度，应该是包含了导航和状态栏
 */
export default function useWindowHeight() {
  const {height} = useWindowDimensions();
  // MacOS下，这里返回总是错误
  //console.log('height', height);
  return height as number;
}
