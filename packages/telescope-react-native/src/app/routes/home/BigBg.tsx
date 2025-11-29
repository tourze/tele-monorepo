import { Image, Platform, StyleSheet } from 'react-native';
import React, { memo } from 'react';

function BigBg() {
  return (
    <Image
      source={Platform.OS === 'ios' ? require('../../images/img_bg_ios.png') : require('../../images/img_bg.png')}
      fadeDuration={0}
      style={styles.background}
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: -5,
    left: 0,
    zIndex: -999,
  },
});

export default memo(BigBg);
