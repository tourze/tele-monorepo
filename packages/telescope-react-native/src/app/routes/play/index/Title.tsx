import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import React from 'react';

function Title({ text, moreClick = null }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      {moreClick !== null && (
        <Pressable
          style={styles.moreBlock}
          onPress={moreClick}
        >
          <Text style={styles.moreText}>更多</Text>
          <Image
            source={require('../../../images/faq_colse.png')}
            fadeDuration={0}
            style={{
              width: 22,
              height: 22,
            }}
            resizeMode="cover"
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  moreBlock: {
    display: 'flex',
    flexDirection: 'row',
    height: 36,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 14,
    color: '#666'
  },
});

export default Title;
