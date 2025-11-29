import { useCallback } from 'react';
import isString from 'lodash/isString';
import { useNavigation } from '@react-navigation/core';
import { get } from '../../hooks/useStorage';
import getPlatform from '../../utils/os/getPlatform';
import { useTranslation } from 'react-i18next';
import Tracking from '../../utils/tracking/Tracking';
import openBrowserUrl from '../../utils/browser/openBrowserUrl';
import alertMessage from '../../utils/ui/alertMessage';

interface RedirectItem {
  path: string;
  tracking?: string;
  title?: string;
  // 其他可能的属性
}

function usePathRedirect() {
  const navigation: any = useNavigation();
  const { t } = useTranslation();

  return useCallback(
    async (item: string | RedirectItem) => {

      //Tracking.info('usePathRedirect', item);
      if (isString(item)) {
        item = {
          path: item,
        };
      }

      if (item.tracking) {
        Tracking.info(item.tracking);
      }

      if (!item.path) {
        return;
      }

      // 替换一些变量
      item.path = item.path.replaceAll('${platform.os}', await getPlatform());

      let userInfo: any = {};
      try {
        userInfo = await get('userInfo');
      } catch (e) { /* empty */
      }
      item.path = item.path.replaceAll('${user.id}', userInfo.id);

      if (item.path.startsWith('webview:')) {
        const url = item.path.replace('webview:', '');
        navigation.push('WebView', {
          title: item.title || '',
          url,
        });
        return;
      }

      if (item.path.startsWith('https://') || item.path.startsWith('http://')) {
        try {
          await openBrowserUrl({ url: item.path });
        } catch (error) {
          Tracking.info('无法打开链接', {
            error: `${error}`,
            ...item,
          });
          alertMessage(`${t('Cannot_Open_Link')} ${item.path}`);
        }
        return;
      }

      if (item.path === '/home' || item.path === 'Home') {
        navigation.popToTop();
      }

      // 这里要做一层新旧链接的兼容
      const map = {
        '/user-center': 'UserCenter',
        '/pricing-plan': 'PricingPlan',
        '/coupon-form': 'CouponForm',
        '/coupon-list': 'CouponList',
        '/advanced': 'AdvancedSetting',
        '/network-protect': 'NetworkProtect',
        '/recharge-list': 'RechargeList',
        '/message-list': 'MessageList',
        '/route-list': 'RouteList',
        '/about-us': 'AboutUs',
        '/login': 'Login',
        '/forget-password': 'ForgetPassword',
        '/share-index': 'ShareIndex',
        '/invite-info': 'InviteInfo',
      };
      const route = map[item.path] || item.path;
      navigation.push(route as any); // 根据实际情况调整类型转换
    },
    [navigation, t]
  );
}

export default usePathRedirect;
