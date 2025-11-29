import React, {Fragment} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {List, ListItem} from '../../react-native-ui-kitten/components';
import Divider from '../../components/Divider';
import LoadingSpin from '../../components/LoadingSpin';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import {useGetStarHomeActiveCards} from '../apis/GetStarHomeActiveCards';

function CouponListPage() {
  const {data: result} = useGetStarHomeActiveCards();

  const renderItem = ({item}) => {
    // console.log('item', item);
    if (!item) {
      return null;
    }

    return (
      <Fragment key={`${item.number}`}>
        <ListItem title={`${item.number}`} description={`${item.activeTime}`} />
        <Divider />
      </Fragment>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
      {result === undefined || result === null ? (
        <LoadingSpin />
      ) : (
        <List
          style={styles.container}
          data={result ? result.list : []}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  },
});

export default withErrorBoundary(CouponListPage, {
  FallbackComponent: CatchError,
});
