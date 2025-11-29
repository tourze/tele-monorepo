import {decode, encode} from 'base-64';

// 原始代码 https://www.npmjs.com/package/ssr-uri-help

function ssrDecode(ssr: string): object | null {
  try {
    const a = ssr.replace('ssr://', '');
    const b = base64Decode(a);
    const [ssStr, paramsStr] = b.split('/?');
    const ssArray = ssStr.split(':');
    const ssrObject: any = {
      server: ssArray[0],
      port: ssArray[1],
      protocol: ssArray[2],
      method: ssArray[3],
      obfs: ssArray[4],
      password: base64Decode(ssArray[5]),
    };
    const paramsArray = paramsStr.split('&');
    paramsArray.forEach((params: string) => {
      if (params.indexOf('obfsparam') > -1) {
        ssrObject.obfsParam = base64Decode(params.split('=')[1]);
      }
      if (params.indexOf('protoparam') > -1) {
        ssrObject.protoParam = base64Decode(params.split('=')[1]);
      }
      if (params.indexOf('remarks') > -1) {
        ssrObject.remarks = base64Decode(params.split('=')[1]);
      }
      if (params.indexOf('group') > -1) {
        ssrObject.group = base64Decode(params.split('=')[1]);
      }
    });
    return ssrObject;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function ssrEncode({
  server,
  port,
  protocol,
  method,
  obfs,
  password,
  obfsParam,
  protoParam,
  remarks = null,
  group = null,
}: any): string {
  const ss = `${server}:${port}:${protocol}:${method}:${obfs}:${base64Encode(
    password,
  )}`;
  const params = [];
  obfsParam && params.push(`obfsparam=${base64Encode(obfsParam)}`);
  protoParam && params.push(`protoparam=${base64Encode(protoParam)}`);
  remarks && params.push(`remarks=${base64Encode(remarks)}`);
  group && params.push(`group=${base64Encode(group)}`);
  return `ssr://${base64Encode(
    ss + (params.length > 0 ? `/?${params.join('&')}` : ''),
  )}`;
}

function ssrRssDecode(ssrRss: string) {
  const ssrArray = base64Decode(ssrRss).split('\n');
  // @ts-ignore
  return ssrArray.reduce((a, b) => (b ? [...a, ssrDecode(b)] : a), []);
}

function ssrRssEncode(ssrArray: any[]) {
  return ssrArray.map(ssr => ssrEncode(ssr));
}

function base64Decode(str: string) {
  return decode(str).replace(/\u0000/g, '');
}

function base64Encode(str: string) {
  return encode(str).replace(/\=/g, '');
}

export {
  ssrDecode,
  ssrEncode,
  ssrRssDecode,
  ssrRssEncode,
  base64Decode,
  base64Encode,
};
