import React, {Fragment} from 'react';
import {StyleSheet, View, Text, ScrollView, StatusBar} from 'react-native';
import {ListItem} from '../../react-native-ui-kitten/components';
import Divider from '../../components/Divider';
import {useTranslation} from 'react-i18next';
import {useGetStarHomeInviteList} from '../apis/GetStarHomeInviteList';
import useSizeTransform from '../../hooks/useSizeTransform';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import EmptyContent from '../../components/EmptyContent';
import LoadingSpin from '../../components/LoadingSpin';

const InviteInfo = () => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  const {data: result, loading} = useGetStarHomeInviteList();

  if (loading) {
    return <LoadingSpin />;
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{padding: sizeTransform(20)}}>
          <Text style={{fontSize: sizeTransform(30)}}>
            {t('Page_InviteInfo_AccumulatedReceived')}
          </Text>

          <View
            style={{
              paddingTop: sizeTransform(10),
            }}>
            <Text>
              {t('Page_InviteInfo_TotalPerson')}： {result.pagination.total}{' '}
              {t('Page_InviteInfo_Person')}
            </Text>
            <Text>
              {t('Page_InviteInfo_TotalMinute')}： {result.totalGetTime}{' '}
              {t('Minute')}
            </Text>
          </View>

          <View
            style={{
              paddingTop: sizeTransform(10),
            }}>
            <Text style={{fontSize: sizeTransform(30)}}>
              {t('Page_InviteInfo_DetailTitle')}
            </Text>
          </View>
        </View>
        <Divider />

        {result.list.length > 0 ? (
          <>
            {result.list.map((item, index) => {
              return (
                <Fragment key={`${index}`}>
                  <Divider />
                  <ListItem
                    title={item.createTime}
                    accessoryRight={() => {
                      return <Text>+{item.getTime}</Text>;
                    }}
                  />
                </Fragment>
              );
            })}
            <Divider />
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: sizeTransform(20),
              }}>
              <Text>{t('Page_InviteInfo_OnlyRecentLogs')}</Text>
            </View>
          </>
        ) : (
          <View style={{flex: 1, paddingTop: sizeTransform(300)}}>
            <EmptyContent text={t('Page_InviteInfo_ListEmpty')} />
          </View>
        )}
      </ScrollView>
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

export default withErrorBoundary(InviteInfo, {
  FallbackComponent: CatchError,
});
