import { StyleSheet, View, Pressable, Text } from 'react-native';
import { useGetCmsCategoryDetail } from '../../../apis/GetCmsCategoryDetail';
import useStorage from '../../../../hooks/useStorage';

function Nav() {
  const {data} = useGetCmsCategoryDetail({ categoryId: 23 });
  const {data: starCateId, update: setStarCateId} = useStorage('star-nav-category-id', 0);

  return (
    <View style={styles.container}>
      {!!data && !!data.children && data.children.map((item) => {
        return (
          <Pressable
            style={styles.link}
            key={`${item.id}-star-nav`}
            onPress={() => {
              setStarCateId(item.id);
            }}
          >
            <Text
              style={[
                styles.text,
                item.id === starCateId && styles.active
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
    width: 80,
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
