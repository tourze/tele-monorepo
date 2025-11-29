import { Image } from 'react-native';
import React, { memo } from 'react';
import useSizeTransform from '../../../hooks/useSizeTransform';

function BigIcon({ connected }) {
  const sizeTransform = useSizeTransform();

  return (
    <Image
      source={connected ? require('../../images/open_sel.png') : require('../../images/open_del.png')}
      fadeDuration={0}
      style={{
        height: sizeTransform(360),
        width: sizeTransform(360),
      }}
      resizeMode="contain"
    />
  );
}

export default memo(BigIcon);
