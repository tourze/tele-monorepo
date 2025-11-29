import React, { memo } from 'react';
import {View, StyleSheet} from 'react-native';
import CountryFlag from './CountryFlag';

const styles = StyleSheet.create({
  container: {
    padding: 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

/**
 * 传入节点，显示它的国旗
 */
function NodeFlag({flag = '', width = 60}) {
  flag = flag ? flag.toLowerCase() : 'hk';

  return (
    <View style={styles.container}>
      <CountryFlag
        isoCode={flag}
        size={width / 3}
        quality="low"
        style={{borderRadius: 2}}
      />
    </View>
  );
}

export default memo(NodeFlag);
