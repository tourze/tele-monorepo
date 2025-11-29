import {getLocales} from 'react-native-localize';
import { memoize } from 'lodash';

const getLocale = memoize(async function () {
  const locales = getLocales();
  return locales[0].languageCode;
});

export default getLocale;
