import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React from 'react';
import {useMemoizedFn, useRequest} from 'ahooks';
import useStorage from '../hooks/useStorage';
import { getSiteDomain } from '../utils/network/getSiteDomain';
import openAppBrowser from '../utils/browser/openAppBrowser';
import PrimaryButton from './button/PrimaryButton';
import Tracking from '../utils/tracking/Tracking';
import exitApp from '../utils/app/exitApp';
import Modal from './Modal';

const styles = StyleSheet.create({
  highlightText: {
    color: '#3C72FF',
  },
  modalButtons: {
    display: 'flex',
    flexDirection: 'row',
  },

  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,

    shadowColor: '#fff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  titleWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  descText: {
    paddingTop: 10,
    paddingBottom: 10,
    color: '#0A0D14',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '400',
  },

  protocolWrapper: {
    fontSize: 12,
    lineHeight: 16.8,
    fontWeight: '400',
    paddingBottom: 30,
  },

  cancelWrapper: {
    marginTop: 10,
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    color: '#9198A6',
    fontSize: 13,
    lineHeight: 18.2,
    fontWeight: '400',
  },
});

function PiiModal() {
  const {data: piiAgree, update: setPiiAgree} = useStorage('piiAgree', false);
  const {data: siteDomain} = useRequest(getSiteDomain);

  const clickProtocolText = useMemoizedFn(async () => {
    Tracking.info('PII弹窗点击用户协议');
    await openAppBrowser({
      url: `${siteDomain}/terms.html`,
    });
  });

  const clickPrivacyText = useMemoizedFn(async () => {
    Tracking.info('PII弹窗点击隐私政策');
    await openAppBrowser({
      url: `${siteDomain}/privacy.html`,
    });
  });

  return (
    <Modal
      isVisible={!piiAgree}
      style={{
        paddingLeft: 40,
        paddingRight: 40,
      }}
      // onBackdropPress={() => setVisible(false)}
    >
      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <Text style={styles.titleText}>用户协议与隐私保护</Text>
        </View>

        <Text style={styles.descText}>
          请你务必审慎阅读、
          充分理解“服务协议”和“隐私政策”各条款、包括但不限于：为了向你提供资讯内容、内容分享等服务，我们需要收集你的设备信息、操作日志等个人信息。你可以在“设置”中查看、变更、删除个人信息井管理你的授权。
        </Text>

        <View style={styles.protocolWrapper}>
          <Text>
            你可阅读
            <Text style={styles.highlightText} onPress={clickProtocolText}>
              用户协议
            </Text>
            、
            <Text style={styles.highlightText} onPress={clickPrivacyText}>
              隐私政策
            </Text>
            了解详细信息。如你同意，请点击“同意”开始接受我们的服务。
          </Text>
        </View>

        <PrimaryButton
          title="同意"
          onClick={async () => {
            await setPiiAgree(true);
          }}
        />
        <TouchableOpacity
          style={styles.cancelWrapper}
          onPress={() => {
            exitApp();
          }}>
          <Text style={styles.cancelText}>不同意并退出</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default PiiModal;
