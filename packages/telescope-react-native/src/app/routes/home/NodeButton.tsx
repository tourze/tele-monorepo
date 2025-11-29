import {useTranslation} from 'react-i18next';
import useSizeTransform from '../../../hooks/useSizeTransform';
import {Image, StyleSheet, Text, View} from 'react-native';
import NodeSpeed from './NodeSpeed';
import React, { memo } from 'react';
import NodeFlag from '../../../components/NodeFlag';
import { useHomeState } from './context/HomeContext';

const styles = StyleSheet.create({
  toCenter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Empty = memo(function () {
  const {t} = useTranslation();

  return (
    <View style={styles.toCenter}>
      <Text
        style={{
          color: '#1971c2',
        }}>
        {t('Page_Home_AutoMode')}
      </Text>
      <Image
        source={require('../../images/faq_colse.png')}
        fadeDuration={0}
        style={{
          width: 30,
          height: 30,
        }}
        resizeMode="cover"
      />
    </View>
  );
});

function NodeButton() {
  const { currentNode, userInfo, channelName } = useHomeState();
  const sizeTransform = useSizeTransform();

  if ((['MTP', 'SM', 'SD', 'QH'].includes(channelName) && !userInfo?.paidUser) || !currentNode) {
    return (
      <Empty />
    );
  }

  return (
    <View style={styles.toCenter}>
      <NodeSpeed ip={currentNode.ip} port={currentNode.port} />
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: sizeTransform(4),
          marginLeft: sizeTransform(10),
        }}>
        <NodeFlag flag={currentNode.flag} />
      </View>
      <Image
        source={require('../../images/faq_colse.png')}
        fadeDuration={0}
        style={{
          width: sizeTransform(60),
          height: sizeTransform(60),
        }}
        resizeMode="cover"
      />
    </View>
  );
}

export default memo(NodeButton);
