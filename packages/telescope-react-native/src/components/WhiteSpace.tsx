import React, { memo } from 'react';
import {View} from 'react-native';

function WhiteSpace({height = 20}) {
  return <View style={{height: height, width: '100%'}} />;
}

export default memo(WhiteSpace);
