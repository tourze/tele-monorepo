import React, { useCallback } from 'react';
import {
  Pressable,
  Image,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';

type CmsItem = {
  id: string | number;
  title: string;
  values: {
    icon?: string;
    downloadUrl?: string;
  };
};

type Props = {
  item: CmsItem;
  onPress: (item: CmsItem) => void;
  style?: StyleProp<ViewStyle>;
};

const AppGridItem = ({ item, onPress, style }: Props) => {
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  const iconSource = item.values?.icon
    ? { uri: item.values.icon }
    : undefined;

  return (
    <Pressable style={[styles.block, style]} onPress={handlePress}>
      {iconSource ? (
        <Image source={iconSource} style={styles.icon} resizeMode="cover" />
      ) : (
        <View style={[styles.icon, styles.iconPlaceholder]} />
      )}
      <View style={styles.title}>
        <Text style={styles.text}>{item.title}</Text>
      </View>
    </Pressable>
  );
};

export default React.memo(
  AppGridItem,
  (prev, next) =>
    prev.item?.id === next.item?.id &&
    prev.item?.title === next.item?.title &&
    prev.item?.values?.icon === next.item?.values?.icon &&
    prev.onPress === next.onPress &&
    prev.style === next.style,
);

const styles = StyleSheet.create({
  block: {
    width: 70,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 50,
    height: 50,
    overflow: 'hidden',
    borderRadius: 50,
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
});
