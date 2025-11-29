import React, { memo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable, Platform
} from 'react-native';
import { useDebounceFn } from 'ahooks';
import {useNavigation} from '@react-navigation/core';
import useSizeTransform from '../../../hooks/useSizeTransform';
import {useTranslation} from 'react-i18next';
import Tracking from '../../../utils/tracking/Tracking';
import { useHomeState } from './context/HomeContext';

const PersonIcon = memo(function() {
  return (
    <Image
      source={require('../../images/icon_person.png')}
      style={{
        width: 36,
        height: 36,
      }}
    />
  )
});

function HeaderLeft() {
  const navigation: any = useNavigation();
  const { token } = useHomeState();

  const clickAction1 = useDebounceFn(async () => {
    Tracking.info('首页-顶部导航-点击个人中心');
    if (token) {
      navigation.push('UserCenter');
    } else {
      navigation.push('Login');
    }
  }, { leading: true, trailing: false });

  return (
    <Pressable
      onPress={clickAction1.run}
      style={{
        marginLeft: 4,
      }}
    >
      <PersonIcon />
    </Pressable>
  );
}

const HeaderRight = () => {
  const {t} = useTranslation();
  const navigation: any = useNavigation();
  const { token } = useHomeState();
  const sizeTransform = useSizeTransform();

  const clickCartButton = useDebounceFn(async () => {
    Tracking.info('首页-顶部导航-点击购物车');
    if (token) {
      navigation.push('PricingPlan');
    } else {
      navigation.push('Login');
    }
  }, { leading: true, trailing: false });

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <TouchableOpacity
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: sizeTransform(20),
          paddingRight: sizeTransform(20),
          paddingTop: sizeTransform(5),
          paddingBottom: sizeTransform(5),
        }}
        onPress={clickCartButton.run}>
        <Text style={{fontSize: sizeTransform(36), fontWeight: 'bold'}}>
          {t('Page_Home_Header_Charge')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const HomeHeader = memo(() => {
  return (
    <View style={styles.container}>
      <HeaderLeft />
      <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20 }}>Telescope</Text>
        <Text style={{ fontSize: 12, color: '#999' }}>探索更广阔的世界</Text>
      </View>
      <HeaderRight />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    padding: 6,
    alignItems: 'center',
    ...Platform.select({
      web: {
        paddingTop: 13,
      },
    }),
  },
});

export default HomeHeader;
