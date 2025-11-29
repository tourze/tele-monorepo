import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useDebounceFn } from 'ahooks';
import React, { useMemo } from 'react';
import useSizeTransform from '../../../hooks/useSizeTransform';
import usePathRedirect from '../../helpers/usePathRedirect';

function GridMenus() {
  const sizeTransform = useSizeTransform();
  const pathRedirect = usePathRedirect();

  const clickCouponForm = useDebounceFn(async () => {
    await pathRedirect('/coupon-form');
  }, { leading: true, trailing: false });

  const clickPricePlan = useDebounceFn(async () => {
    await pathRedirect('/pricing-plan');
  }, { leading: true, trailing: false });

  const menuPadding = sizeTransform(12);

  const menuList = useMemo(
    () => [
      {
        key: 'pricing-plan',
        title: '充值',
        icon: require('../../images/user-center/9650f782cba955be1feb812a9710ca7a.png'),
        onPress: clickPricePlan.run,
      },
      {
        key: 'coupon-form',
        title: '卡券',
        icon: require('../../images/user-center/78621e6a1cd22a708b09d4704a952fa2.png'),
        onPress: clickCouponForm.run,
      },
    ],
    [clickCouponForm.run, clickPricePlan.run],
  );

  return (
    <View style={styles.container}>
      {menuList.map(menu => (
        <TouchableOpacity
          key={menu.key}
          style={[styles.menuItem, { padding: menuPadding }]}
          onPress={menu.onPress}
        >
          <Image
            source={menu.icon}
            fadeDuration={0}
            style={styles.menuIcon}
          />
          <Text>{menu.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default React.memo(GridMenus);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 2,
  },
  menuItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    marginBottom: 1,
  },
});
