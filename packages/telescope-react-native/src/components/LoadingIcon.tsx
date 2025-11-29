import React, { memo } from 'react';
import {Bounce, Circle, Wave} from 'react-native-animated-spinkit';

function LoadingIcon({size = 24, color = '#000', type = 'bounce'}) {
  if (type === 'bounce') {
    return <Bounce size={size} color={color} />;
  }
  if (type === 'wave') {
    return <Wave size={size} color={color} />;
  }
  if (type === 'circle') {
    return <Circle size={size} color={color} />;
  }
  return null;
}

export default memo(LoadingIcon);
