import React, { useCallback } from 'react';
import {
  Pressable,
  Image,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

type CmsItem = {
  id: string | number;
  title: string;
  values: {
    avatar?: string;
  };
};

type Props = {
  item: CmsItem;
  onPress: (item: CmsItem) => void;
  style?: StyleProp<ViewStyle>;
};

const PeopleCard = ({ item, onPress, style }: Props) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const avatarSource = item.values?.avatar
    ? { uri: item.values.avatar }
    : undefined;

  return (
    <Pressable style={[styles.block, style]} onPress={handlePress}>
      {avatarSource ? (
        <Image source={avatarSource} style={styles.icon} resizeMode="cover" />
      ) : (
        <View style={[styles.icon, styles.iconPlaceholder]} />
      )}
      <View style={styles.title}>
        <Text style={styles.text}>{item.title}</Text>
      </View>
      <View style={styles.viewButton}>
        <Text style={styles.viewText}>查看详情</Text>
      </View>
    </Pressable>
  );
};

export default React.memo(
  PeopleCard,
  (prev, next) =>
    prev.item?.id === next.item?.id &&
    prev.item?.title === next.item?.title &&
    prev.item?.values?.avatar === next.item?.values?.avatar &&
    prev.onPress === next.onPress &&
    prev.style === next.style,
);

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    width: 100,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    padding: 10,
  },
  icon: {
    width: 60,
    height: 60,
    overflow: 'hidden',
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
  },
  iconPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  text: {
    textAlign: 'center',
    fontSize: 12,
  },
  viewButton: {
    backgroundColor: '#3567ff',
    width: '100%',
    padding: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  viewText: {
    color: '#fff',
    fontSize: 12,
  },
});
