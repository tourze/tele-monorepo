import { StyleSheet, View, Pressable, Text } from 'react-native';
import useStorage from '../../../../hooks/useStorage';
import { useGetCmsCategoryDetail } from '../../../apis/GetCmsCategoryDetail';

function Nav() {
  const {data} = useGetCmsCategoryDetail({ categoryId: 24 });
  const {data: appCateId, update: setAppCateId} = useStorage('app-nav-category-id', 0);

  return (
    <View style={styles.container}>
      {!!data && !!data.children && data.children.map((item) => {
        return (
          <Pressable
            style={styles.link}
            key={`${item.id}-star-nav`}
            onPress={() => {
              setAppCateId(item.id);
            }}
          >
            <Text
              style={[
                styles.text,
                item.id === appCateId && styles.active
              ]}
            >
              {item.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 70,
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 20,
  },
  link: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  active: {
    color: '#3567ff',
  },
});

export default Nav;
