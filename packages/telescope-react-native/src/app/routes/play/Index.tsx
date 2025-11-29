import React from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../../components/CatchError';
// import News from './index/News';
import Banner from './index/Banner';
import Apps from './index/Apps';
import Peoples from './index/Peoples';

function PlayIndexPage() {
  const padding = 10;

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={[styles.container, { padding }]}>
        <Banner />
        {/*<News />*/}
        <Apps />
        <Peoples />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f1f1f1',
  },
});

export default withErrorBoundary(PlayIndexPage, {
  FallbackComponent: CatchError,
});
