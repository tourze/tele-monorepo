import React, { memo } from 'react';
import {View, Image, Text, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import isEmpty from 'lodash/isEmpty';
import useSizeTransform from '../hooks/useSizeTransform';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 200,
    height: 200,
    marginTop: -100,
  },
});

function EmptyContent({text = ''}) {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/no_record.png')}
        fadeDuration={0}
        style={styles.img}
      />
      <Text
        style={{
          marginTop: -20,
          fontSize: sizeTransform(32),
        }}>
        {!isEmpty(text) ? text : t('Component_EmptyContent_DefaultMessage')}
      </Text>
    </View>
  );
}

export default memo(EmptyContent);
