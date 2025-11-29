import { Image, Linking, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SwiperFlatList } from 'react-native-swiper-flatlist';
import React, { useEffect, useState } from 'react';
import { useGetDiyPageElementByCode } from '../../../apis/GetDiyPageElementByCode';

const CODE = 'play-index-banner';

function Banner() {
  const {width} = useWindowDimensions();
  const padding = 10;

  const {data} = useGetDiyPageElementByCode({ codes: [CODE] });
  const [banners, setBanners] = useState([]);
  useEffect(() => {
    if (data) {
      const items = data[CODE].validElements;
      setBanners(items);
    }
  }, [data]);

  return (
    <View style={styles.bannerContainer}>
      <SwiperFlatList
        autoplay
        autoplayDelay={2}
        autoplayLoop
        index={2}
        showPagination
        data={banners}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.bannerChild,
              { width: width - padding * 2 }
            ]}
            onPress={() => {
              //console.log('item', item);
              Linking.openURL(item.path);
            }}
          >
            <Image
              source={{ uri: item.thumb1 }}
              style={{
                width: '100%',
                height: '100%',
              }}
              resizeMode="cover"
            />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 160,
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
  bannerChild: {
    flex: 1,
    height: '100%',
  },
  bannerText: { fontSize: 20, textAlign: 'center' },
});

export default Banner;
