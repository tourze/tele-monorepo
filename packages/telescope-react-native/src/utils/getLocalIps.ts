// import isObject from 'lodash/isObject';
// import isEmpty from 'lodash/isEmpty';
// import ipRegex from 'ip-regex';
//
// const urlMap = {
//   'https://webapi-pc.meitu.com/common/ip_location': async function (response) {
//     response = JSON.parse(response);
//     if (!isObject(response.data)) {
//       return null;
//     }
//     const keys = Object.keys(response.data);
//     return keys[0];
//   },
//   'https://whois.pconline.com.cn/ipJson.jsp?ip=&json=true': async function (response) {
//     response = JSON.parse(response);
//     return response.ip ? response.ip : null;
//   },
//   'https://api.ip.sb/geoip/': async function (response) {
//     response = JSON.parse(response);
//     return response.ip ? response.ip : null;
//   },
//   'http://demo.ip-api.com/json/?lang=zh-CN': async function (response) {
//     response = JSON.parse(response);
//     return response.query ? response.query : null;
//   },
//   'http://httpbin.org/ip': async function (response) {
//     response = JSON.parse(response);
//     return response.origin ? response.origin : null;
//   },
//   'https://ip-api.io/json': async function (response) {
//     response = JSON.parse(response);
//     return response.ip ? response.ip : null;
//   },
//   'https://ipapi.co/json/': async function (response) {
//     response = JSON.parse(response);
//     return response.ip ? response.ip : null;
//   },
//   'https://ip234.in/ip.json': async function (response) {
//     response = JSON.parse(response);
//     return response.ip ? response.ip : null;
//   },
//   'https://ip.useragentinfo.com/json': async function (response) {
//     response = JSON.parse(response);
//     return response.ip ? response.ip : null;
//   },
//   'https://api.ipapi.is/': async function (response) {
//     response = JSON.parse(response);
//     return response.ip ? response.ip : null;
//   },
//   'https://api.qjqq.cn/api/Local': async function (response) {
//     response = JSON.parse(response);
//     return response.ip ? response.ip : null;
//   },
//   'https://myip.ipip.net/': async function (response) {
//     const result = response.match(ipRegex());
//     return isEmpty(result) ? null : result[0];
//   },
//   'https://api.ip.cc/': async function (response) {
//     const result = response.match(ipRegex());
//     return isEmpty(result) ? null : result[0];
//   },
//   'https://www.sudops.com/ipmy': async function (response) {
//     const result = response.match(ipRegex());
//     return isEmpty(result) ? null : result[0];
//   },
//   'https://ping0.cc/geo': async function (response) {
//     const result = response.match(ipRegex());
//     return isEmpty(result) ? null : result[0];
//   },
//   'http://vv.video.qq.com/checktime?otype=json': async function (response) {
//     const result = response.match(ipRegex());
//     return isEmpty(result) ? null : result[0];
//   },
// };
