import React from 'react';
import {View, StyleSheet} from 'react-native';
import SpeedDisplay from '../../../components/SpeedDisplay';
import useSizeTransform from '../../../hooks/useSizeTransform';
import CheckmarkIcon from '../../icons/Checkmark';

function RouteListInfo({node, speed, selected}) {
  const sizeTransform = useSizeTransform();

  return (
    <View style={styles.main}>
      <SpeedDisplay speed={speed} />

      <View
        style={{
          paddingLeft: sizeTransform(10),
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <CheckmarkIcon selected={selected} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default RouteListInfo;
