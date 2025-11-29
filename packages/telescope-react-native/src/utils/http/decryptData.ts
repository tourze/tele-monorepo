import CryptoJS from 'crypto-js';

function decryptData(
  cipherText: string,
  signSecret: string,
  signKey: string,
): string {
  const key = CryptoJS.SHA256(signSecret).toString(); // Generate 256-bit encryption key
  const iv = CryptoJS.MD5(signKey).toString(); // Generate 16-byte initial vector

  const decrypted = CryptoJS.AES.decrypt(
    cipherText,
    CryptoJS.enc.Hex.parse(key),
    {
      iv: CryptoJS.enc.Hex.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}

export default decryptData;
