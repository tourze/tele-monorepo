import { SvgProps } from 'react-native-svg';
import { createIconsMap } from './createIconsMap';
import { IconPack } from '../components';

export const EvaIconsPack: IconPack<SvgProps> = {
  name: 'eva',
  icons: createIconsMap(),
};

