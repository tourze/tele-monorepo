import { Image, StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  rankText: {
    color: '#333',
    fontSize: 14,
  },
  rankIcon: {
    width: 20,
    height: 20,
  },
});

function NumberComp({ idx }) {
  if (idx === 0) {
    return (
      <Image
        source={require('../../images/icon/rank1.png')}
        style={styles.rankIcon}
        resizeMode='cover'
      />
    );
  }
  if (idx === 1) {
    return (
      <Image
        source={require('../../images/icon/rank2.png')}
        style={styles.rankIcon}
        resizeMode='cover'
      />
    );
  }
  if (idx === 2) {
    return (
      <Image
        source={require('../../images/icon/rank3.png')}
        style={styles.rankIcon}
        resizeMode='cover'
      />
    );
  }

  return (
    <Text style={styles.rankText}>{idx}</Text>
  );
}

export default NumberComp;
