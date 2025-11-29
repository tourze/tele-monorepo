import React, {Fragment} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {ListItem, List, Card} from '../../react-native-ui-kitten/components';
import Divider from '../../components/Divider';
import {fetcher, clearCache as clearRequestCache} from '../hooks/useRequest';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';
import {API_GET_PAY} from '../constants';
import {useTranslation} from 'react-i18next';
import debounceClick from '../../utils/debounceClick';
import useSizeTransform from '../../hooks/useSizeTransform';
import {withErrorBoundary} from 'react-error-boundary';
import CatchError from '../../components/CatchError';
import LoadingSpin from '../../components/LoadingSpin';
import Loading from '../../utils/ui/Loading';
import Tracking from '../../utils/tracking/Tracking';
import toastError from '../../utils/ui/toastError';
import toastSuccess from '../../utils/ui/toastSuccess';
import openBrowserUrl from '../../utils/browser/openBrowserUrl';
import setClipboardText from '../../utils/clipboard/setClipboardText';
import Modal from '../../components/Modal';
import alertMessage from '../../utils/ui/alertMessage';
import {useMemoizedFn, useSafeState} from 'ahooks';
import {useGetStarHomePackageList} from '../apis/GetStarHomePackageList';
import {useGetStarHomePayChannel} from '../apis/GetStarHomePayChannel';
import {useGetStarHomeUserInfo} from '../apis/GetStarHomeUserInfo';

const ItemTitle = React.memo(({title}: any) => {
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 2,
      }}>
      <Text>{`${title}`}</Text>
      <Image
        source={require('../images/icon_label_vip.png')}
        fadeDuration={0}
        style={{
          marginLeft: 5,
          width: 32,
          height: 12,
        }}
      />
    </View>
  );
});

const PricingPlan = ({navigation}) => {
  const {t} = useTranslation();
  const sizeTransform = useSizeTransform();

  const [payUrl, setPayUrl] = useSafeState(null);

  const [channelVisible, setChannelVisible] = useSafeState(false);
  const hideChannelModal = useMemoizedFn(() => {
    setChannelVisible(false);
  });

  const [orderInfo, setOrderInfo] = useSafeState(null);

  const [statusVisible, setStatusVisible] = useSafeState(false);
  const hideStatusModal = useMemoizedFn(() => {
    setStatusVisible(false);
    setPayUrl(null);
  });

  const [currentPlan, setCurrentPlan] = useSafeState(null);

  const {refresh: refreshUserInfo} = useGetStarHomeUserInfo();
  const {data: plans} = useGetStarHomePackageList();
  const {data: channels} = useGetStarHomePayChannel();

  const renderItemAccessory = props => {
    //console.log('renderItemAccessory', props);
    return (
      <View
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 4,
        }}>
        <Text
          style={{
            color: '#4dabf7',
          }}>
          {props.priceStr}
        </Text>
        <Text style={{textDecorationLine: 'line-through'}}>
          {props.showPriceStr}
        </Text>
      </View>
    );
  };

  const renderItem = ({item, index}) => {
    const itemStyle: any = {};
    if (currentPlan && currentPlan.id === item.id) {
      itemStyle.backgroundColor = '#ddd';
    }

    return (
      <>
        <ListItem
          style={itemStyle}
          onPress={debounceClick(() => {
            setCurrentPlan(item);
          })}
          title={() => {
            return <ItemTitle title={item.title} />;
          }}
          description={() => {
            return (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 2,
                }}>
                <Image
                  source={require('../images/icon_label_zeng.png')}
                  fadeDuration={0}
                  style={{
                    marginLeft: sizeTransform(10),
                    width: sizeTransform(36),
                    height: sizeTransform(36),
                    marginRight: sizeTransform(10),
                  }}
                />
                <View
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  <Text numberOfLines={2}>{`${item.content}`}</Text>
                </View>
              </View>
            );
          }}
          accessoryRight={renderItemAccessory.bind(null, item)}
        />
        <Divider />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      <SafeAreaView
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
        {plans === undefined || plans === null ? (
          <LoadingSpin />
        ) : (
          <List style={styles.container} data={plans} renderItem={renderItem} />
        )}

        {!!currentPlan && (
          <>
            <Divider />
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
              }}>
              <View
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text>支付金额：</Text>
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 20,
                  }}>
                  {currentPlan.priceStr}
                </Text>
              </View>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <TouchableOpacity
                  onPress={debounceClick(() => {
                    if (!channels) {
                      return;
                    }
                    setChannelVisible(true);
                  })}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: '#1c7ed6',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingTop: 8,
                    paddingLeft: 15,
                    paddingRight: 15,
                    paddingBottom: 8,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 12,
                    }}>
                    {t('Page_PricingPlan_ConfirmOrder')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>

      <Modal isVisible={channelVisible} onBackdropPress={hideChannelModal}>
        <Card
          disabled={true}
          header={() => {
            return (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: sizeTransform(24),
                }}>
                <Text style={{fontSize: sizeTransform(36)}}>选择支付方式</Text>
              </View>
            );
          }}>
          {channels?.map((item, index) => {
            if (item.channel === '提示') {
              return null;
            }

            return (
              <Fragment key={`${index}`}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={debounceClick(async () => {
                    await Loading.show('提交中');
                    try {
                      // 开始提交订单
                      const res = await fetcher(API_GET_PAY, {
                        goodsId: currentPlan.id,
                        channel_id: item.channel_id,
                        payChannel: item.channel,
                        method: 'wap.H5',
                        quantity: '1',
                      });
                      await Loading.hide();

                      // {
                      // "orderNo": "20230420234211585",
                      // "payChannel": "dalizf",
                      // "payUrl": "https://api-2.quickg.cc/api/v2/pay_submit/20230420234211585",
                      // "quantity": 1,
                      // "total": 19.8
                      // }
                      setOrderInfo(res.data);

                      if (res.data.payUrl) {
                        const url = res.data.payUrl;
                        setPayUrl(url);

                        try {
                          await openBrowserUrl({url});
                          Tracking.info('支付链接打开成功', {
                            url,
                          });
                        } catch (e) {
                          Tracking.info('支付链接打开失败', {
                            url,
                            error: `${e}`,
                            from: 1,
                          });
                          alertMessage(t('Page_PricingPlan_OpenPayLinkFailed'));
                          await setClipboardText({
                            text: url,
                          });

                          setChannelVisible(false);
                          setStatusVisible(true);
                          return;
                        }
                      } else {
                        Tracking.info('创建订单后找不到支付链接', {
                          res: JSON.stringify(res),
                        });
                        setPayUrl(null);
                      }
                    } catch (error) {
                      await Loading.hide();
                      toastError(error.message);
                      return;
                    } finally {
                      await Loading.hide();
                    }

                    setChannelVisible(false);
                    setStatusVisible(true);
                  })}
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: sizeTransform(10),
                    paddingRight: sizeTransform(10),
                    paddingTop: sizeTransform(20),
                    paddingBottom: sizeTransform(20),
                  }}>
                  {item.name.includes('USDT') ? (
                    <Image
                      source={require('../images/USDT.png')}
                      style={{
                        width: sizeTransform(60),
                        height: sizeTransform(60),
                      }}
                    />
                  ) : (
                    <Image
                      source={require('../images/hot.png')}
                      style={{
                        width: sizeTransform(60),
                        height: sizeTransform(60),
                      }}
                    />
                  )}
                  <Text
                    style={{
                      marginLeft: sizeTransform(20),
                    }}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
                <Divider />
              </Fragment>
            );
          })}
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 5,
            }}>
            <Text
              style={{
                color: 'red',
                marginTop: sizeTransform(20),
                fontSize: sizeTransform(36),
              }}>
              {t('Page_PricingPlan_DisconnectBeforeCharge')}
            </Text>
            <Text
              style={{
                color: '#ff6b6b',
                marginTop: sizeTransform(20),
              }}>
              {t('Page_PricingPlan_ContactUsIfNotFinished')}
            </Text>
          </View>
        </Card>
      </Modal>

      <Modal isVisible={statusVisible} onBackdropPress={hideStatusModal}>
        <Card
          disabled={true}
          header={() => {
            return (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: 6,
                }}>
                <Text>{t('Page_PricingPlan_Paying')}</Text>
              </View>
            );
          }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={debounceClick(() => {
              hideStatusModal();
              setOrderInfo(null);
            })}
            style={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              backgroundColor: '#71717a',
            }}>
            <Text style={{color: '#fff'}}>
              {t('Page_PricingPlan_Button_Unfinished')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={debounceClick(async () => {
              if (!orderInfo) {
                alertMessage(t('Page_PricingPlan_OrderNotFound'));
                return;
              }

              await Loading.show('检查中');
              try {
                // CheckStarHomeOrderPayStatus
                const res = await callTsJsonRpcAPI('tesla', {
                  outTradeNo: orderInfo.orderNo,
                });
                hideStatusModal();
                if (res.message) {
                  toastSuccess(res.message);
                }
                clearRequestCache();
                refreshUserInfo();
                navigation.popToTop();
              } catch (error) {
                toastError(error.message);
              } finally {
                await Loading.hide();
              }
            })}
            style={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
              marginTop: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 10,
              backgroundColor: '#228be6',
            }}>
            <Text style={{color: '#fff'}}>
              {t('Page_PricingPlan_Button_Finished')}
            </Text>
          </TouchableOpacity>

          {!!payUrl && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={debounceClick(async () => {
                try {
                  await setClipboardText({
                    text: payUrl,
                  });
                  await openBrowserUrl({url: payUrl});
                  Tracking.info('支付链接打开成功', {
                    url: payUrl,
                  });
                } catch (e) {
                  alertMessage(t('Page_PricingPlan_OpenPayLinkFailed'));
                  Tracking.info('支付链接打开失败', {
                    url: payUrl,
                    error: `${e}`,
                    from: 2,
                  });
                  return;
                }

                setChannelVisible(false);
                setStatusVisible(true);
              })}
              style={{
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                marginTop: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 10,
                backgroundColor: '#ff6b6b',
              }}>
              <Text style={{color: '#fff'}}>
                {t('Page_PricingPlan_Button_PayAgain')}
              </Text>
            </TouchableOpacity>
          )}

          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 5,
            }}>
            <Text style={{color: '#ff6b6b', marginTop: 10}}>
              {t('Page_PricingPlan_ContactUsIfNotFinished')}
            </Text>
            <Text style={{color: '#ff6b6b', marginTop: 10}}>
              {t('Page_PricingPlan_DisconnectBeforeCharge')}
            </Text>
          </View>
        </Card>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
});

export default withErrorBoundary(PricingPlan, {
  FallbackComponent: CatchError,
});
