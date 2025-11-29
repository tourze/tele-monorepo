import { getName } from '@tauri-apps/api/app';
import { memoize } from 'lodash';

/**
 * 我们自己的进程，需要直连，不走代理
 */
const getProcessRules = memoize(async function() {
  const appName = await getName();

  return [
    {
      process_name: [
        'gost',
        'gost.exe',
        'ss_local',
        'ss_local.exe',
        'sing-box',
        'sing-box.exe',
        appName,
        `${appName}.exe`,
      ],
      outbound: 'direct',
    },
    {
      process_name: [
        "Telegram",
        "Telegram.exe",
      ],
      outbound: 'proxy'
    },
  ];
});

export default getProcessRules;
