import { Text, Pressable, View } from 'react-native';
import React from 'react';
import useSizeTransform from '../../../hooks/useSizeTransform';
import {useTranslation} from 'react-i18next';
import BigIcon from './BigIcon';
import useHomeConnectButton from './hooks/useHomeConnectButton';

function ConnectBtn({navigation}: any) {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();
  const {
    connected,
    onConnectPress,
  } = useHomeConnectButton({ navigation });

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: sizeTransform(12),
        flex: 1,
      }}>
      <Pressable onPress={onConnectPress}>
        <BigIcon connected={connected} />
      </Pressable>
      <Text
        style={{
          color: '#1971c2',
          marginTop: 6,
        }}>
        {connected ? t('Page_Home_Connect_YES') : t('Page_Home_Connect_NO')}
      </Text>
    </View>
  );
}

export default ConnectBtn;
