import { StyleSheet, Text, View, Image, ScrollView, Pressable } from 'react-native';
import NumberComp from '../NumberComp';
import { useGetCmsEntityList } from '../../../apis/GetCmsEntityList';
import openBrowserUrl from '../../../../utils/browser/openBrowserUrl';

function Rank() {
  const {data} = useGetCmsEntityList({
    modelCode: 'app',
  });

  return (
    <ScrollView style={styles.container}>
      {!!data && !!data.list && data.list.map((item: any, idx: number) => {
        return (
          <Pressable
            style={styles.item}
            key={`rank-${item.id}`}
            onPress={async () => {
              await openBrowserUrl({url: item.values.downloadUrl});
            }}
          >
            <View style={styles.rank}>
              <NumberComp idx={idx} />
            </View>
            <Image
              source={{ uri: item.values.icon }}
              style={styles.icon}
              resizeMode='cover'
            />
            <View style={styles.body}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>{item.values.desc ?? item.title}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },

  item: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    alignItems: 'center',
  },

  rank: {
    width: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 10,
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  desc: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    overflow: 'hidden',
  },
});

export default Rank;
