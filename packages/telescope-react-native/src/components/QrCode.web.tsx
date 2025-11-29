import React, { memo } from 'react';
import isEmpty from 'lodash/isEmpty';
import useQRCodeGenerator from 'react-hook-qrcode-svg';

const QRCODE_LEVEL = 'Q';
const QRCODE_BORDER = 4;

function QrCode__forWeb({value, size}: {value: string; size: number}) {
  const {path, viewBox} = useQRCodeGenerator(
    value,
    QRCODE_LEVEL,
    QRCODE_BORDER,
  );

  if (isEmpty(path)) {
    return null;
  }
  return (
    <svg width={size - 2} height={size - 2} viewBox={viewBox} stroke="none">
      <rect width="100%" height="100%" fill="#ffffff" />
      <path d={path} fill="#000000" />
    </svg>
  );
}

export default memo(QrCode__forWeb);
