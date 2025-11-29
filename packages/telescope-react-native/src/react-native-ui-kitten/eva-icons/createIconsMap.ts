import { SvgProps } from 'react-native-svg';
import { findIconByName } from 'react-native-eva-icons/icons';
import { EvaIcon } from './evaIcon.component';
import { IconProvider } from '../components';

export const createIconsMap = (): { [key: string]: IconProvider<SvgProps> } => {
  return new Proxy({}, {
    get(target, name: string): IconProvider<SvgProps> {
      return new EvaIcon(findIconByName(name));
    },
  });
};
