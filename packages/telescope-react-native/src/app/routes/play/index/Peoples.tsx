import { StyleSheet, View, FlatList, ListRenderItemInfo } from 'react-native';
import Title from './Title';
import React, { useCallback, useState } from 'react';
import { useNavigation } from '@react-navigation/core';
import Opener from '../stars/Opener';
import { nanoid } from 'nanoid/non-secure';
import useCmsList from '../hooks/useCmsList';
import PeopleCard from './PeopleCard';

function Peoples() {
  const navigation: any = useNavigation();

  const [currentItem, setCurrentItem] = useState<any>(null);

  const { list } = useCmsList<any>({
    modelCode: 'star',
  });

  const handleMore = useCallback(() => {
    navigation.push('StarIndexPage');
  }, [navigation]);

  const handlePress = useCallback((item: any) => {
    setCurrentItem({
      ...item,
      count: nanoid(),
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<any>) => (
      <PeopleCard item={item} onPress={handlePress} />
    ),
    [handlePress],
  );

  const keyExtractor = useCallback((item: any) => `people-${item.id}`, []);

  return (
    <>
      <View style={styles.container}>
        <Title
          text='你可能感兴趣的人'
          moreClick={handleMore}
        />
        <FlatList
          data={list ?? []}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={Math.min(4, (list ?? []).length || 0)}
        />
      </View>
      {!!currentItem && (<Opener item={currentItem} />)}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 30,
  },
  listContent: {
    paddingVertical: 4,
  },
});

export default Peoples;
