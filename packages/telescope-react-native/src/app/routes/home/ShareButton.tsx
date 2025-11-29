import { Image, Pressable, Text, View } from 'react-native';
import Divider from '../../../components/Divider';
import React, { memo } from 'react';
import useStorage from '../../../hooks/useStorage';
import { useDebounceFn } from 'ahooks';
import Tracking from '../../../utils/tracking/Tracking';
import useSizeTransform from '../../../hooks/useSizeTransform';

function ShareButton({ navigation }) {
  const {data: token} = useStorage('token', null);
  const {data: config} = useStorage('config');

  const clickButtonShare = useDebounceFn(() => {
    Tracking.info('首页-底部-点击邀请赠20%');

    if (!token) {
      navigation.push('Login');
      return;
    }

    navigation.push('ShareIndex');
  }, { leading: true, trailing: false });

  if (!config?.shareAction) {
    return null;
  }
  return (
    <>
      <Pressable onPress={clickButtonShare.run}>
        <InnerView />
      </Pressable>
      <Divider />
    </>
  );
}

const InnerView = memo(function () {
  const sizeTransform = useSizeTransform();

  return (
    <View
      style={{
        paddingTop: sizeTransform(10),
        paddingBottom: sizeTransform(20),
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Image
        source={require('../../images/clinking_beer_mugs.gif')}
        fadeDuration={0}
        style={{
          width: sizeTransform(80),
          height: sizeTransform(80),
          marginRight: sizeTransform(20),
        }}
      />
      <Text
        style={{
          fontSize: sizeTransform(30),
          fontWeight: 'bold',
        }}>
        邀请赠20%
      </Text>
    </View>
  );
});

export default ShareButton;
