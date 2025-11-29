import React, { memo } from 'react';
import { Image } from 'react-native';

function CheckmarkIcon({ selected }) {
  return (
    <Image
      source={selected ? require('../images/icon_checkmark_1.png') : require('../images/icon_checkmark_0.png')}
      style={{
        width: 36,
        height: 36,
      }}
    />
  );
}

export default memo(CheckmarkIcon);
