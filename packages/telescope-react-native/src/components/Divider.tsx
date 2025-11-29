import {StyleSheet, View} from 'react-native';
import { memo } from 'react';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 1,
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
});

function Divider() {
  return <View style={styles.container} />;
}

export default memo(Divider);
