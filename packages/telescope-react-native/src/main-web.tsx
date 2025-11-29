import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './app/App';
import getPlatform from './utils/os/getPlatform';
import { setAppId, setAppSecret } from './utils/http/callAPI';
import { getCurrentWindow } from '@tauri-apps/api/window';
import getChannelName from './utils/app/getChannelName';
import getVersionName from './utils/app/getVersionName';
import './main-web.css';
import getSidecarPath from './utils/vpn/sing-box/getSidecarPath';
import { getTray } from './desktop/tray';

// 让应用更像原生UI
if (process.env.NODE_ENV === 'production') {
  require('./web/moreLikeWindowUI');
}

getPlatform().then(async (res: string) => {
  if (res === 'mac' || res === 'Darwin') {
    setAppId('ip.cip.cc');
    setAppSecret('+call_user_method_array(\'methodName\', $object);');
  }
  if (res === 'windows' || res === 'Windows_NT' || res === 'win32') {
    setAppId('github.com');
    setAppSecret('typo: change bot-type link to help center docs. #27292');
  }

  const channelName = await getChannelName();
  const versionName = await getVersionName();
  await getCurrentWindow().setTitle(`Telescope v${versionName} - ${channelName}`);

  const singBoxPath = await getSidecarPath('sing-box');
  //alert(singBoxPath);
  console.log('singBoxPath', singBoxPath);
});

// 生成菜单
getTray(true);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
