import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useDebounceFn, useMemoizedFn } from 'ahooks';
import Tracking from '../../../utils/tracking/Tracking';
import React from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/core';
import useSizeTransform from '../../../hooks/useSizeTransform';
import {useTranslation} from 'react-i18next';
import {useGetStarHomeUserInfo} from '../../apis/GetStarHomeUserInfo';
import convertMinutesToReadableFormat from '../../../utils/convertMinutesToReadableFormat';

function UserHeader() {
  const navigation: any = useNavigation();
  const sizeTransform = useSizeTransform();
  const {t} = useTranslation();
  const {data: userInfo, refresh} = useGetStarHomeUserInfo();

  // focus时就刷新一次
  useFocusEffect(useMemoizedFn(() => {
    refresh();
  }));

  const clickLogin = useDebounceFn(() => {
    Tracking.info('点击登录');

    // remove('username');
    // remove('password');
    // remove('token');
    // remove('expiredIn');
    // remove('user');
    // await remove('currentNode');

    // clearRequestCache();
    // clearJsonRpcCache();

    // navigate(-1);
    // setTimeout(() => {
    //   navigate('/login');
    // }, 300);
    navigation.push('Login');
  }, { leading: true, trailing: false });

  return (
    <View style={[styles.container, { padding: sizeTransform(36) }]}>
      <View style={styles.infoSection}>
        <TouchableOpacity onPress={clickLogin.run}>
          {!userInfo?.email ? (
            <Text style={styles.loginText}>
              {t('Page_UserCenter_LoginOrRegister')}
            </Text>
          ) : (
            <Text style={styles.logoutText}>
              {t('Page_UserCenter_Logout')}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.subText, { marginTop: sizeTransform(4) }]}>
          {userInfo ? userInfo.username : '加载中...'}
        </Text>

        {userInfo && userInfo.timeRemaining === 0 ? (
          <Text style={[styles.expiredText, { marginTop: sizeTransform(4) }]}>
            {t('Page_UserCenter_Expired')}
          </Text>
        ) : (
          <Text style={[styles.subText, { marginTop: sizeTransform(4) }]}>
            {`${t('Page_UserCenter_RestDay')}${
              userInfo
                ? convertMinutesToReadableFormat(userInfo.timeRemaining, t)
                : '加载中...'
            }`}
          </Text>
        )}
        <Text style={[styles.subText, { marginTop: sizeTransform(4) }]}>
          {t('Page_UserCenter_HighSpeedFlow')}:{' '}
          {userInfo ? userInfo.flowRemaining : '加载中...'}
        </Text>
      </View>
      <View style={styles.avatarSection}>
        <Image
          source={require('../../images/avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.idText}>
          ID {userInfo?.id}
        </Text>
      </View>
    </View>
  );
}

export default React.memo(UserHeader);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoSection: {
    flex: 3,
    flexDirection: 'column',
  },
  avatarSection: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    marginBottom: 3,
  },
  loginText: {
    fontWeight: 'bold',
    color: 'blue',
  },
  logoutText: {
    fontWeight: 'bold',
  },
  subText: {
    color: '#111',
  },
  idText: {
    color: '#111',
    marginTop: 3,
  },
  expiredText: {
    color: 'red',
  },
});
