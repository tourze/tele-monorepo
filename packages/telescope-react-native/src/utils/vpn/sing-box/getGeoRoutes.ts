import {resolveResource} from '@tauri-apps/api/path';
import { memoize } from 'lodash';
import fixPath from '../tauri/fixPath';

const getGeoRoutes = memoize(async function() {
  // https://github.com/SagerNet/sing-geosite
  const geositeFilePath = fixPath(await resolveResource('geosite.db'));
  // https://github.com/SagerNet/sing-geoip
  const geoipFilePath = fixPath(await resolveResource('geoip.db'));

  return {
    geosite: {
      path: geositeFilePath,
    },
    geoip: {
      path: geoipFilePath,
    },
  };
});

export default getGeoRoutes;
