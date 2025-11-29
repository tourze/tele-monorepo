import DeviceInfo from 'react-native-device-info';

/**
 * 统一获取运营商名称，异常或平台不支持时返回 null
 */
async function getCarrier(): Promise<string | null> {
  try {
    const carrier = await DeviceInfo.getCarrier();
    if (!carrier) {
      return null;
    }
    return carrier;
  } catch (error) {
    console.warn('getCarrier 调用失败', error);
    return null;
  }
}

export default getCarrier;
