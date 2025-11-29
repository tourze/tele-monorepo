import { StyleSheet, Text, View, Image, ScrollView, Pressable } from 'react-native';
import useStorage from '../../../../hooks/useStorage';
import { useGetCmsEntityList } from '../../../apis/GetCmsEntityList';
import openBrowserUrl from '../../../../utils/browser/openBrowserUrl';

function Items() {
  const {data: appCateId} = useStorage('app-nav-category-id', 0);
  const {data} = useGetCmsEntityList({
    modelCode: 'app',
    categoryId: appCateId ? appCateId : undefined,
  });

  return (
    <ScrollView style={styles.container}>
      {!!data && !!(data as any).list && (data as any).list.map((item: any) => {
        //console.log('ffffffffff', item);

        return (
          <Pressable
            style={styles.item}
            key={`app-item-${item.id}`}
            onPress={async () => {
              await openBrowserUrl({url: item.values.downloadUrl});
            }}
          >
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

export default Items;
