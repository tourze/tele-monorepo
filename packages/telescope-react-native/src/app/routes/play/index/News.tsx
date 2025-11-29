import { StyleSheet, View, Image, Text } from 'react-native';
import Title from './Title';

function News() {
  return (
    <View style={styles.container}>
      <Title text='墙外新鲜事' />
      <View style={styles.blocks}>
        <View style={styles.block}>
          <Image
            source={{ uri: 'https://wegame.gtimg.com/g.31-r.3fa8e/info/oss_58f8551a3acf0.jpg/320' }}
            style={styles.icon}
            resizeMode='cover'
          />
          <View style={styles.title}>
            <Text style={styles.text}>查看全球热点</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Image
            source={{ uri: 'https://wegame.gtimg.com/g.31-r.3fa8e/info/oss_58f8551a3acf0.jpg/320' }}
            style={styles.icon}
            resizeMode='cover'
          />
          <View style={styles.title}>
            <Text style={styles.text}>查看全球热点</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Image
            source={{ uri: 'https://wegame.gtimg.com/g.31-r.3fa8e/info/oss_58f8551a3acf0.jpg/320' }}
            style={styles.icon}
            resizeMode='cover'
          />
          <View style={styles.title}>
            <Text style={styles.text}>查看全球热点</Text>
          </View>
        </View>

        <View style={styles.block}>
          <Image
            source={{ uri: 'https://wegame.gtimg.com/g.31-r.3fa8e/info/oss_58f8551a3acf0.jpg/320' }}
            style={styles.icon}
            resizeMode='cover'
          />
          <View style={styles.title}>
            <Text style={styles.text}>查看全球热点</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 20,
  },
  blocks: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  block: {
    width: 90,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    borderRadius: 5,
  },
  icon: {
    width: 90,
    height: 90,
    overflow: 'hidden',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  text: {
    textAlign: 'center',
    fontSize: 12,
  }
});

export default News;
