import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
} from 'react-native';
import {withErrorBoundary} from 'react-error-boundary';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import CatchError from '../../../components/CatchError';
import Nav from './stars/Nav';
import Items from './stars/Items';
import Rank from './stars/Rank';

function StarIndexPage() {
  const [segIndex, setSegIndex] = useState(0);

  const padding = 20;

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
      <View style={[styles.container, { padding }]}>
        <SegmentedControl
          values={['类别', '热度排行']}
          selectedIndex={segIndex}
          onChange={(event) => {
            setSegIndex(event.nativeEvent.selectedSegmentIndex);
          }}
        />
        <View style={styles.body}>
          {segIndex === 0 && (
            <>
              <Nav />
              <Items />
            </>
          )}
          {segIndex === 1 && (
            <Rank />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#f1f1f1',
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  },
});

export default withErrorBoundary(StarIndexPage, {
  FallbackComponent: CatchError,
});
