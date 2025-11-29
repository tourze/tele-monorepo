import {useRequest} from 'ahooks';
import callTsJsonRpcAPI from '../helpers/callTsJsonRpcAPI';
import {set} from '../../hooks/useStorage';

async function GetStarHomeUserInfo() {
  try {
    // GetStarHomeUserInfo
    return callTsJsonRpcAPI('java');
  } catch (error) {
    return null;
  }
}

function useGetStarHomeUserInfo() {
  const {data, loading, run, cancel, refresh} = useRequest(GetStarHomeUserInfo, {
    pollingInterval: 1000 * 30, // 30s轮训一次
    pollingWhenHidden: false,
    retryCount: 5, // 重试5次
    throttleWait: 1000, // 节流
    cacheKey: 'GetStarHomeUserInfo',
    cacheTime: 1000 * 30,
    // 因为有些地方是需要是不走hooks的，所以我们保存一份到本地吧
    onSuccess: async (res: any) => {
      await set('userInfo', res);
    },
  });

  // console.log('userInfo', userInfo);
  // {
  //     "channel": "GW",
  //     "email": "",
  //     "expiredDate": "2023-06-29",
  //     "flowRemaining": "20.0GB",
  //     "flowTotal": "20.0GB",
  //     "flowUsed": "20.53KB",
  //     "id": 276365,
  //     "inviteBy": "",
  //     "inviteCode": "X4378DXH",
  //     "inviteUrl": "https://telescopes.vip/app.html?invite_code=X4378DXH&channel=GW",
  //     "isTrial": true,
  //     "paidUser": false,
  //     "status": 0,
  //     "subUrl": "",
  //     "timeRemaining": 27562,
  //     "totalTransfer": 21474836481,
  //     "username": "User_6791201192171767237",
  //     "vip": 0
  // }
  return {data, loading, run, cancel, refresh};
}

export {GetStarHomeUserInfo, useGetStarHomeUserInfo};
