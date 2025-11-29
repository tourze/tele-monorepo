import React from 'react';
import QRCode from 'react-native-qrcode-svg';

function QrCode__forNative({value, size}: {value: string; size: number}) {
  return <QRCode value={value} size={size} />;
}

export default QrCode__forNative;
