import React, {useEffect} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import {useTranslation} from 'react-i18next';
import WebView from 'react-native-webview';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  page: {
    flex: 1,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
  },
});

const WebViewPage = ({route, navigation}: {route: any; navigation: any}) => {
  const {t} = useTranslation();

  let {title, url} = route.params;
  // console.log('title', title);
  // console.log('url', hexToString(url));
  console.log('WebViewPage', title, url);

  useEffect(() => {
    navigation.setOptions({
      title: title === '' ? t('Brand_Name') : title,
    });
  }, [navigation, t, title]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      {!!url && (
        <WebView
          source={{uri: url}}
          style={styles.page}
          // allowsLinkPreview
          // automaticallyAdjustContentInsets
          // javaScriptEnabled
          // useSharedProcessPool={false}
          onError={event => {
            console.log('webview onError', event);
          }}
        />
      )}
      {/*{url && <Text>{url}</Text>}*/}
    </View>
  );
};

export default withErrorBoundary(WebViewPage, {
  FallbackComponent: CatchError,
});
