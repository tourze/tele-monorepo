import {useWindowDimensions} from 'react-native';

export default function useWindowHeight() {
  const {width} = useWindowDimensions();
  // MacOS下，这里返回总是错误
  //console.log('height', height);
  return width as number;
}
