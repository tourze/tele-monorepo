import React from 'react';
import {StyleSheet, View, Text, StatusBar} from 'react-native';
import {Layout, List, ListItem} from '../../react-native-ui-kitten/components';
import Divider from '../../components/Divider';
import isEmpty from 'lodash/isEmpty';
import {useTranslation} from 'react-i18next';
import LoadingSpin from '../../components/LoadingSpin';
import useSizeTransform from '../../hooks/useSizeTransform';
import debounceClick from '../../utils/debounceClick';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import {useGetStarHomeAdList} from '../apis/GetStarHomeAdList';
import Tracking from '../../utils/tracking/Tracking';
import openBrowserUrl from '../../utils/browser/openBrowserUrl';
import alertMessage from '../../utils/ui/alertMessage';

const MessageListPage = ({ navigation }) => {
  const {t} = useTranslation();
  const {data: adData} = useGetStarHomeAdList();
  const sizeTransform = useSizeTransform();

  const renderItem = ({item, index}) => (
    <>
      <ListItem
        onPress={debounceClick(async () => {
          if (isEmpty(item.msgLink)) {
            return;
          }

          if (item.msgLink.startsWith('http')) {
            try {
              await openBrowserUrl({url: item.msgLink});
              Tracking.info('消息列表打开成功');
            } catch (e) {
              Tracking.info('消息列表打开失败');
              alertMessage(`${t('Cannot_Open_Link')} ${item.msgLink}`);
            }
            return;
          }
          navigation.push(item.msgLink);
        })}
        title={`${item.title}`}
        description={
          <View>
            <Text
              style={{
                marginTop: sizeTransform(5),
                color: '#71717a',
              }}>{`${item.contents}`}</Text>
            <Text
              style={{
                marginTop: sizeTransform(5),
                color: '#71717a',
              }}>{`${item.msgTime}`}</Text>
          </View>
        }
        accessoryRight={() => {
          // console.log('index', index);
          if (index % 4 === 0) {
            return (
              <View
                style={{
                  paddingTop: sizeTransform(5),
                  paddingLeft: sizeTransform(10),
                  paddingRight: sizeTransform(10),
                  paddingBottom: sizeTransform(5),
                  backgroundColor: '#ff6b6b',
                  borderTopLeftRadius: sizeTransform(15),
                  borderTopRightRadius: sizeTransform(15),
                  borderBottomLeftRadius: sizeTransform(15),
                  borderBottomRightRadius: sizeTransform(15),
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: sizeTransform(16),
                  }}>
                  NEW
                </Text>
              </View>
            );
          }
          return null;
        }}
      />
      <Divider />
    </>
  );

  return (
    <Layout style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      {adData ? (
        <List style={styles.container} data={adData} renderItem={renderItem} />
      ) : (
        <LoadingSpin />
      )}
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default withErrorBoundary(MessageListPage, {
  FallbackComponent: CatchError,
});
