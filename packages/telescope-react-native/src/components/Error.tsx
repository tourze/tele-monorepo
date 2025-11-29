import React, { memo } from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 300,
    height: 300,
    marginTop: -100,
  },
});

function Error({text = ''}) {
  const {t} = useTranslation();

  return (
    <View style={styles.container}>
      <Image
        source={require('../images/error.png')}
        fadeDuration={0}
        style={styles.img}
      />
      <Text
        style={{
          marginTop: -60,
        }}>
        {text ? text : t('Component_Error_DefaultMessage')}
      </Text>
    </View>
  );
}

export default memo(Error);
