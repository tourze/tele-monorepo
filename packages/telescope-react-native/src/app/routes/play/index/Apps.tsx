import { StyleSheet, View, FlatList, ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import Title from './Title';
import React, { useCallback } from 'react';
import useCmsList from '../hooks/useCmsList';
import openBrowserUrl from '../../../../utils/browser/openBrowserUrl';
import AppGridItem from './AppGridItem';

function Apps() {
  const navigation: any = useNavigation();

  const { list } = useCmsList<any>({
    modelCode: 'app',
  });

  const handleMore = useCallback(() => {
    navigation.push('AppIndexPage');
  }, [navigation]);

  const handleItemPress = useCallback(async (item: any) => {
    const url = item?.values?.downloadUrl;
    if (!url) {
      return;
    }
    await openBrowserUrl({ url });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<any>) => (
      <AppGridItem item={item} onPress={handleItemPress} />
    ),
    [handleItemPress],
  );

  const keyExtractor = useCallback((item: any) => `app-${item.id}`, []);

  return (
    <View style={styles.container}>
      <Title
        text='海外火爆应用'
        moreClick={handleMore}
      />
      <FlatList
        data={list ?? []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={4}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        initialNumToRender={Math.min(8, (list ?? []).length)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 10,
  },
  columnWrapper: {
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 10,
  },
});

export default Apps;
