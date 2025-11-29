import React, {useEffect} from 'react';
import {
  BackHandler,
  StyleSheet,
  Image,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Platform,
  StatusBar,
} from 'react-native';
import Modal from '../../components/Modal';
import {fetcher} from '../hooks/useRequest';
import {API_INVITE_ACTIVE} from '../constants';
import {useGetStarHomeUserInfo} from '../apis/GetStarHomeUserInfo';
import useStorage from '../../hooks/useStorage';
import {useFocusEffect} from '@react-navigation/core';
import useSizeTransform from '../../hooks/useSizeTransform';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import {useTranslation} from 'react-i18next';
import QrCode from '../../components/QrCode';
import toastError from '../../utils/ui/toastError';
import toastSuccess from '../../utils/ui/toastSuccess';
import setClipboardText from '../../utils/clipboard/setClipboardText';
import Loading from '../../utils/ui/Loading';
import PrimaryButton from '../../components/button/PrimaryButton';
import { useDebounceFn, useMemoizedFn, useSafeState } from 'ahooks';
import TsInput from '../../components/TsInput';

const ShareIndex = ({navigation}) => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  const [codeVisible, setCodeVisible] = useSafeState(false);
  const hideCodeModal = useMemoizedFn(() => {
    setCodeVisible(false);
  });

  const [codeValue, setCodeValue] = useSafeState('');

  const gotoInviteInfo = useDebounceFn(() => {
    navigation.push('InviteInfo');
  }, { leading: true, trailing: false });

  const submitAction = useDebounceFn(async () => {
    await Loading.show();
    try {
      const res = await fetcher(API_INVITE_ACTIVE, {
        inviteCode: codeValue,
      });
      toastSuccess(res.message);
    } catch (error) {
      toastError(error.message);
      return;
    } finally {
      await Loading.hide();
    }

    setCodeVisible(false);
  }, { leading: true, trailing: false });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={Platform.select({
            web: {
              marginRight: sizeTransform(20),
            },
          })}
          onPress={() => setCodeVisible(true)}>
          <Text>{t('Page_ShareIndex_BindInviter')}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, t]);

  const {data: userInfo} = useGetStarHomeUserInfo();

  const {data: config} = useStorage('config');

  // https://reactnavigation.org/docs/custom-android-back-button-handling/
  useFocusEffect(() => {
    let subscription;
    if (Platform.OS !== 'web') {
      const onBackPress = () => {
        if (codeVisible === true) {
          setCodeVisible(false);
          return true;
        }
        return false;
      };
      subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
    }
    return () => {
      subscription && subscription.remove();
    };
  });

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: '#339af0',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -999,
          }}>
          <Image
            resizeMode="contain"
            source={require('../images/img_bg_share.png')}
            fadeDuration={0}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </View>

        <View
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: 48,
            width: sizeTransform(550),
            marginLeft: sizeTransform(100),
          }}>
          <Pressable
            onPress={async () => {
              await setClipboardText({
                text: userInfo?.inviteCode,
              });
              toastSuccess(t('Copy_Success'));
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                backgroundColor: '#fff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
              }}>
              <Text
                style={{
                  marginBottom: 3,
                  fontWeight: 'bold',
                }}>
                {t('Page_ShareIndex_YourInviteCode')}
              </Text>

              {!!userInfo && (
                <>
                  <Text
                    style={{
                      marginBottom: 4,
                      fontWeight: 'bold',
                      fontSize: 32,
                    }}>
                    {userInfo?.inviteCode}
                  </Text>
                  <QrCode value={userInfo?.inviteUrl} size={140} />
                  <Text
                    style={{
                      marginTop: 20,
                      color: '#1c7ed6',
                      fontSize: 12,
                    }}>
                    {t('Page_ShareIndex_InputNotice1')}
                    {config?.inviteAddTime === `0${t('Minute')}`
                      ? ''
                      : `${config?.inviteAddTime}，`}
                    {config?.inviteAddFlow}
                    {t('Page_ShareIndex_InputNotice2')}
                  </Text>
                </>
              )}
            </View>
          </Pressable>

          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 6,
              paddingLeft: 40,
              paddingRight: 40,
              paddingBottom: 6,
              marginTop: 20,
              backgroundColor: '#1c7ed6',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              borderBottomLeftRadius: 20,
              borderBottomRightRadius: 20,
            }}
            onPress={gotoInviteInfo.run}>
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
              }}>
              {t('Page_ShareIndex_InviteList')}
            </Text>
          </TouchableOpacity>

          {!!config && (
            <View
              style={{
                paddingTop: sizeTransform(30),
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Pressable
                onPress={async () => {
                  await setClipboardText({
                    text: config?.homeUrl,
                  });
                  toastSuccess(t('Copy_Success'));
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: sizeTransform(30),
                  }}>
                  {t('Page_ShareIndex_NewWebsite')}: {config?.homeUrl}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      <Modal isVisible={codeVisible} onBackdropPress={hideCodeModal}>
        <View style={styles.modalContainer}>
          <View
            style={{
              paddingBottom: 10,
            }}>
            <TsInput
              placeholder={t('Page_ShareIndex_InputInviteCode')}
              value={codeValue}
              onChangeText={nextValue => setCodeValue(nextValue)}
            />
          </View>
          <PrimaryButton
            title={t('Submit')}
            size="small"
            onClick={submitAction.run}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  modalContainer: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
});

export default withErrorBoundary(ShareIndex, {
  FallbackComponent: CatchError,
});
