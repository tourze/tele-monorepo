import React, { useCallback, useMemo } from 'react';
import UserCenterListItem from './list-item';
import Divider from '../../../components/Divider';
import { Platform, FlatList, ListRenderItemInfo } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import useUserCenterLinks, { UserCenterLink } from './hooks/useUserCenterLinks';

function ListLinks() {
  const navigation: any = useNavigation();

  const handleNavigatePlay = useCallback(() => {
    navigation.push('PlayIndexPage');
  }, [navigation]);

  const { links } = useUserCenterLinks({
    platform: Platform.OS,
    onNavigateToPlay: handleNavigatePlay,
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<UserCenterLink>) => (
      <UserCenterListItem
        item={item.item}
        onClick={item.onPress ?? undefined}
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: UserCenterLink) => item.key, []);

  const renderSeparator = useCallback(() => <Divider />, []);

  const dataSource = useMemo(() => links ?? [], [links]);

  return (
    <FlatList
      data={dataSource}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={renderSeparator}
      contentInsetAdjustmentBehavior="automatic"
      scrollEnabled
    />
  );
}

export default ListLinks;
