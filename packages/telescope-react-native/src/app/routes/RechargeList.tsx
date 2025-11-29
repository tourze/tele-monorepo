import React, {Fragment} from 'react';
import {StatusBar, StyleSheet, Text} from 'react-native';
import {Layout, List, ListItem} from '../../react-native-ui-kitten/components';
import Divider from '../../components/Divider';
import isEmpty from 'lodash/isEmpty';
import {useGetStarHomeOrderList} from '../apis/GetStarHomeOrderList';
import useSizeTransform from '../../hooks/useSizeTransform';
import LoadingSpin from '../../components/LoadingSpin';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import EmptyContent from '../../components/EmptyContent';

const RechargeListPage = () => {
  const sizeTransform = useSizeTransform();
  const {data: result} = useGetStarHomeOrderList();

  const renderItem = ({item, index}) => (
    <Fragment key={`${index}`}>
      <ListItem
        title={item.orderItem.goodsName}
        description={item.createdAt}
        accessoryRight={() => {
          return (
            <Text style={{fontSize: sizeTransform(30)}}>
              {item.totalString}
            </Text>
          );
        }}
      />
      <Divider />
    </Fragment>
  );

  const renderList = () => {
    if (result === undefined || result === null) {
      return <LoadingSpin />;
    }
    if (isEmpty(result.list)) {
      return <EmptyContent />;
    }
    return (
      <List
        style={styles.container}
        data={result.list}
        renderItem={renderItem}
      />
    );
  };

  return (
    <Layout style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      {renderList()}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default withErrorBoundary(RechargeListPage, {
  FallbackComponent: CatchError,
});
