import React from 'react';
import {Text, Pressable, View, StyleSheet} from 'react-native';
import { useDebounceFn } from 'ahooks';
import {useNavigation} from '@react-navigation/core';
import useSizeTransform from '../../../hooks/useSizeTransform';
import Tracking from '../../../utils/tracking/Tracking';
import RollingBar from '../../../components/RollingBar';
import {useGetStarHomeAdList} from '../../apis/GetStarHomeAdList';

function HomeMessage() {
  const sizeTransform = useSizeTransform();
  const navigation: any = useNavigation();

  const clickAd = useDebounceFn(() => {
    Tracking.info('首页-最新公告-点击公告');
    navigation.push('MessageList');
  }, { leading: true, trailing: false });

  const {data: adData} = useGetStarHomeAdList();

  if (!adData) {
    return null;
  }
  if (adData.length === 0) {
    return null;
  }
  return (
    <Pressable onPress={clickAd.run}>
      <View
        style={{
          height: sizeTransform(100),
          padding: sizeTransform(10),
        }}>
        <View
          style={{
            flex: 1,
            backgroundColor: '#e7f5ff',
            borderTopLeftRadius: sizeTransform(50),
            borderTopRightRadius: sizeTransform(50),
            borderBottomLeftRadius: sizeTransform(50),
            borderBottomRightRadius: sizeTransform(50),
          }}>
          <RollingBar
            interval={2000}
            defaultStyle={false}
            customStyle={{
              paddingLeft: 20,
              paddingRight: 20,
            }}>
            {adData.map((item, index: number) => {
              return (
                <Text style={styles.title} numberOfLines={1} key={`${index}`}>
                  {item.title}
                </Text>
              );
            })}
          </RollingBar>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#1971c2',
  },
});

export default HomeMessage;
