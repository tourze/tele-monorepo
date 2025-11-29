import {Text, View, StyleSheet} from 'react-native';
import isEmpty from 'lodash/isEmpty';
import useStorage from '../../hooks/useStorage';
import LoadingIcon from '../../components/LoadingIcon';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 9999999,
  },
  title: {
    color: '#fff',
    marginTop: 20,
  },
});

function LoadingContainer() {
  const {data: loadingShow} = useStorage('loadingShow', false);
  const {data: loadingText} = useStorage('loadingText', '');

  if (!loadingShow) {
    return null;
  }
  return (
    <View style={styles.container}>
      <LoadingIcon type="wave" size={48} color="#FFF" />
      <Text style={styles.title}>
        {!isEmpty(loadingText) ? loadingText : '加载中'}
      </Text>
    </View>
  );
}

export default LoadingContainer;
