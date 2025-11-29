import React from 'react';
import UserCenterListItem from './list-item';
import { ScrollView } from 'react-native';
import Divider from '../../../components/Divider';

function ListLinks__forTauri() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <UserCenterListItem
        item={{
          title: '充值记录',
          thumb1: require('../../images/user-center/743543a7f9c60977b241123709cb068c.png'),
          path: '/recharge-list',
        }}
      />
      <Divider />

      <UserCenterListItem
        item={{
          title: '帮助中心',
          thumb1: require('../../images/user-center/64ec61e6686ae7989620676665c13a96.png'),
          path: 'https://telescopes.vip/help.html',
        }}
      />
      <Divider />

      <UserCenterListItem
        item={{
          title: '在线客服',
          thumb1: require('../../images/user-center/f14b0ce9ef0a96c30fad6ea743264f64.png'),
          path: 'webview:https://go.crisp.chat/chat/embed/?website_id=c35ca3c8-cab7-4b1c-8960-d2ff200974c6&user_nickname=${user.id}_${platform.os}',
        }}
      />
      <Divider />

      <UserCenterListItem
        item={{
          title: '官方网站',
          thumb1: require('../../images/user-center/282a9f7207dc5ffa1d74eb98d249d3ab.png'),
          path: 'https://telescopes.vip/',
        }}
      />
      <Divider />

      <UserCenterListItem
        item={{
          title: '关于我们',
          thumb1: require('../../images/user-center/b4cd4e152a632a074d097893c4e2aa13.png'),
          path: '/about-us',
        }}
      />
      <Divider />

      <UserCenterListItem
        item={{
          title: '大家都在玩',
          thumb1: require('../../images/user-center/852a4af97fa8539c1643ea6e40319996.png'),
          path: 'https://page.telescopeclothing.com/da-jia-dou-zai-wan.html',
        }}
      />
    </ScrollView>
  );
}

export default ListLinks__forTauri;
