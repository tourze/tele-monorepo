import React, { memo } from 'react';
import {StyleSheet, View} from 'react-native';
import LoadingIcon from './LoadingIcon';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function LoadingSpin() {
  return (
    <View style={styles.container}>
      <LoadingIcon type="circle" size={50} color="#3567ff" />
    </View>
  );
}

export default memo(LoadingSpin);
