import {Platform} from 'react-native';
import { memoize } from 'lodash';

const getPlatform = memoize(async function (): Promise<string> {
  return Platform.OS;
});

export default getPlatform;
