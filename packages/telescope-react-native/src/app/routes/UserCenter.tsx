import React from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';
import Divider from '../../components/Divider';
import useSizeTransform from '../../hooks/useSizeTransform';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import ListLinks from './user-center/ListLinks';
import GridMenus from './user-center/GridMenus';
import UserHeader from './user-center/UserHeader';

const UserCenter = () => {
  const sizeTransform = useSizeTransform();

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      <View style={{padding: sizeTransform(10)}}>
        <UserHeader />
        <Divider />
        <GridMenus />
      </View>
      <Divider />

      <ListLinks />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
});

export default withErrorBoundary(UserCenter, {
  FallbackComponent: CatchError,
});
