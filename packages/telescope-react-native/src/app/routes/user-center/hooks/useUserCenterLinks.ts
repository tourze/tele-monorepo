import { useMemo } from 'react';
import { useGetStarHomeUserInfo } from '../../../apis/GetStarHomeUserInfo';
import { useRequest } from 'ahooks';
import getChannelName from '../../../../utils/app/getChannelName';
import useStorage from '../../../../hooks/useStorage';

const LIMITED_CHANNELS = ['MTP', 'SM', 'SD', 'QH'];

type UseUserCenterLinksOptions = {
  platform: string;
  onNavigateToPlay?: () => void;
};

type UserCenterLink = {
  key: string;
  item: {
    title: string;
    thumb1: any;
    path?: string;
  };
  onPress?: () => void;
};

function useUserCenterLinks(
  options: UseUserCenterLinksOptions,
): { links: UserCenterLink[] } {
  const { platform, onNavigateToPlay } = options;
  const { data: userInfo } = useGetStarHomeUserInfo();
  const { data: channelName } = useRequest(getChannelName);
  const { data: config } = useStorage('config');

  const allowChannelFeatures = useMemo(() => {
    const restricted = LIMITED_CHANNELS.includes(channelName as string);
    if (!restricted) {
      return true;
    }
    return !!userInfo?.paidUser;
  }, [channelName, userInfo?.paidUser]);

  const canShowPeoplePlay = useMemo(() => {
    return allowChannelFeatures && !!userInfo?.paidUser;
  }, [allowChannelFeatures, userInfo?.paidUser]);

  const links = useMemo<UserCenterLink[]>(() => {
    const result: UserCenterLink[] = [];

    if (platform === 'android') {
      result.push({
        key: 'network-protect',
        item: {
          title: '网速保护',
          thumb1: require('../../../images/user-center/5ddc20da19201831141c4d1113647281.png'),
          path: '/network-protect',
        },
      });
    }

    result.push({
      key: 'recharge-list',
      item: {
        title: '充值记录',
        thumb1: require('../../../images/user-center/743543a7f9c60977b241123709cb068c.png'),
        path: '/recharge-list',
      },
    });

    if (allowChannelFeatures) {
      result.push({
        key: 'help-center',
        item: {
          title: '帮助中心',
          thumb1: require('../../../images/user-center/64ec61e6686ae7989620676665c13a96.png'),
          path: 'https://telescopes.vip/help.html',
        },
      });
    }

    result.push({
      key: 'online-service',
      item: {
        title: '在线客服',
        thumb1: require('../../../images/user-center/f14b0ce9ef0a96c30fad6ea743264f64.png'),
        path: 'webview:https://go.crisp.chat/chat/embed/?website_id=c35ca3c8-cab7-4b1c-8960-d2ff200974c6&user_nickname=${user.id}_${platform.os}',
      },
    });

    result.push({
      key: 'official-site',
      item: {
        title: '官方网站',
        thumb1: require('../../../images/user-center/282a9f7207dc5ffa1d74eb98d249d3ab.png'),
        path: config?.homeUrl ?? 'https://telescopes.vip/',
      },
    });

    result.push({
      key: 'advanced-setting',
      item: {
        title: '高级设置',
        thumb1: require('../../../images/user-center/03471284436dbf4f359e7477be0dc915.png'),
        path: '/advanced',
      },
    });

    result.push({
      key: 'about-us',
      item: {
        title: '关于我们',
        thumb1: require('../../../images/user-center/b4cd4e152a632a074d097893c4e2aa13.png'),
        path: '/about-us',
      },
    });

    if (canShowPeoplePlay && onNavigateToPlay) {
      result.push({
        key: 'play-index',
        item: {
          title: '大家都在玩',
          thumb1: require('../../../images/user-center/852a4af97fa8539c1643ea6e40319996.png'),
        },
        onPress: onNavigateToPlay,
      });
    }

    return result;
  }, [allowChannelFeatures, canShowPeoplePlay, config?.homeUrl, onNavigateToPlay, platform]);

  return {
    links,
  };
}

export type { UserCenterLink, UseUserCenterLinksOptions };
export default useUserCenterLinks;
