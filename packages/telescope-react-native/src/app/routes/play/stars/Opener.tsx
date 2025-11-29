import React, { useRef, useEffect, useState } from 'react';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { Image, StyleSheet, Text, View } from 'react-native';
import Divider from '../../../../components/Divider';
import { ListItem } from '../../../../react-native-ui-kitten/components';
import openBrowserUrl from '../../../../utils/browser/openBrowserUrl';

const styles = StyleSheet.create({
  actionSheetContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 20,
    paddingBottom: 20,
  },
  actionSheetNotice: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});

function Opener({ item }) {
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const [facebookUrl, setFacebookUrl] = useState('');
  const [instgramUrl, setInstgramUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');

  useEffect(() => {
    setFacebookUrl(item.values.facebookUrl);
    setInstgramUrl(item.values.instgramUrl);
    setTiktokUrl(item.values.tiktokUrl);
    setTwitterUrl(item.values.twitterUrl);
    actionSheetRef.current?.show();
  }, [item]);

  return (
    <ActionSheet ref={actionSheetRef}>
      <View style={styles.actionSheetContainer}>
        <Text style={styles.actionSheetNotice}>使用TelescopeVPN可以直接访问相关人物的海外社交媒体主页</Text>
        <Text style={styles.actionSheetNotice}>如遇到任何问题，请联系客服</Text>
      </View>

      {!!instgramUrl && (
        <>
          <Divider />
          <ListItem
            title='Instgram主页'
            onPress={async () => {
              await openBrowserUrl({url: instgramUrl});
              actionSheetRef.current?.show();
            }}
            accessoryRight={(
              <Image
                source={require('../../../images/faq_colse.png')}
                fadeDuration={0}
                style={{
                  width: 22,
                  height: 22,
                }}
                resizeMode="cover"
              />
            )}
          />
        </>
      )}
      {!!tiktokUrl && (
        <>
          <Divider />
          <ListItem
            title='Tiktok主页'
            onPress={async () => {
              await openBrowserUrl({url: tiktokUrl});
              actionSheetRef.current?.show();
            }}
            accessoryRight={(
              <Image
                source={require('../../../images/faq_colse.png')}
                fadeDuration={0}
                style={{
                  width: 22,
                  height: 22,
                }}
                resizeMode="cover"
              />
            )}
          />
        </>
      )}
      {!!facebookUrl && (
        <>
          <Divider />
          <ListItem
            title='Facebook主页'
            onPress={async () => {
              await openBrowserUrl({url: facebookUrl});
              actionSheetRef.current?.show();
            }}
            accessoryRight={(
              <Image
                source={require('../../../images/faq_colse.png')}
                fadeDuration={0}
                style={{
                  width: 22,
                  height: 22,
                }}
                resizeMode="cover"
              />
            )}
          />
        </>
      )}
      {!!twitterUrl && (
        <>
          <Divider />
          <ListItem
            title='Twitter主页'
            onPress={async () => {
              await openBrowserUrl({url: twitterUrl});
              actionSheetRef.current?.show();
            }}
            accessoryRight={(
              <Image
                source={require('../../../images/faq_colse.png')}
                fadeDuration={0}
                style={{
                  width: 22,
                  height: 22,
                }}
                resizeMode="cover"
              />
            )}
          />
        </>
      )}
      <Divider />
    </ActionSheet>
  );
}

export default Opener;
