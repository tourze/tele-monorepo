import RNQRGenerator from 'rn-qr-generator';
import Tracking from '../tracking/Tracking';

async function detectQrCode(uri: string) {
  let res = null;

  try {
    const scanRes = await RNQRGenerator.detect({
      uri: uri,
    });
    console.log('scanRes', scanRes);
    // scanRes {"type": "QRCode", "values": ["a31c4d13e73a9b80124a53fc130164ef27954b58"]}
    // scanRes {"type": "", "values": []}
    if (scanRes.type === 'QRCode') {
      res = scanRes.values[0];
    }
  } catch (err) {
    Tracking.info('RecoverAccountAndroid识别照片失败', {
      err,
      uri,
    });
  }

  if (res === null) {
    throw new Error('解码失败，请重新选择');
  }
  return res;
}

export default detectQrCode;
