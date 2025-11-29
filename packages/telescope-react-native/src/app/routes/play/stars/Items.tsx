import { StyleSheet, Text, View, Image, ScrollView, Pressable } from 'react-native';
import useStorage from '../../../../hooks/useStorage';
import { useGetCmsEntityList } from '../../../apis/GetCmsEntityList';
import React, { useState } from 'react';
import Opener from './Opener';
import { nanoid } from 'nanoid/non-secure';

function Items() {
  const {data: starCateId} = useStorage('star-nav-category-id', 0);
  const {data} = useGetCmsEntityList({
    modelCode: 'star',
    categoryId: starCateId ? starCateId : undefined,
  });

  const [currentItem, setCurrentItem] = useState(null);

  return (
    <>
      <ScrollView style={styles.container}>
        {!!data && !!data.list && data.list.map((item, index) => {
          //console.log('item', item);
          return (
            <Pressable
              key={`star-items-${item.id}`}
              style={styles.item}
              onPress={() => {
                setCurrentItem({
                  ...item,
                  count: nanoid(),
                });
              }}
            >
              <Image
                source={{ uri: item.values.avatar }}
                style={styles.icon}
                resizeMode='cover'
              />
              <View style={styles.body}>
                <View style={styles.header}>
                  <Text style={styles.title}>{item.title}</Text>

                  {!!item.values.instgramUrl && (
                    <Image
                      source={require('../../../images/icon/instgram.png')}
                      style={styles.socialMedia}
                      resizeMode='cover'
                    />
                  )}
                  {!!item.values.tiktokUrl && (
                    <Image
                      source={require('../../../images/icon/tiktok.png')}
                      style={styles.socialMedia}
                      resizeMode='cover'
                    />
                  )}
                  {!!item.values.facebookUrl && (
                    <Image
                      source={require('../../../images/icon/facebook.png')}
                      style={styles.socialMedia}
                      resizeMode='cover'
                    />
                  )}
                  {!!item.values.twitterUrl && (
                    <Image
                      source={require('../../../images/icon/twitter.png')}
                      style={styles.socialMedia}
                      resizeMode='cover'
                    />
                  )}

                </View>
                <Text style={styles.desc} numberOfLines={2}>{item.values.desc ?? item.title}</Text>
              </View>
            </Pressable>
          );
        })}

        {!!currentItem && (<Opener item={currentItem} />)}
      </ScrollView>
    </>
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

  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  socialMedia: {
    width: 16,
    height: 16,
    marginRight: 2,
  },

  desc: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
    overflow: 'hidden',
  },
});

export default Items;
