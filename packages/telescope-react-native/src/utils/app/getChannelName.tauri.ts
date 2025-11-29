import { memoize } from 'lodash';
import { invoke } from '@tauri-apps/api/core';
import { exists, readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';

const getChannelName__forWeb = memoize(async function () {
  if (process.env.TAURI_CHANNEL !== undefined) {
    return `${process.env.TAURI_CHANNEL}`;
  }

  const channelFile = 'channel.json';
  if (await exists(channelFile, { baseDir: BaseDirectory.Resource })) {
    // 尝试读取
    const contents = await readTextFile(channelFile, { baseDir: BaseDirectory.Resource });
    const json = JSON.parse(contents); // { "name": "GW" }
    return json.name;
  }

  try {
    const channel = await invoke('plugin:ttmanager|get_channel');
    return channel as string;
  } catch (err) {
    console.warn(
      '读取渠道值发生错误，是否忘记设置 TAURI_CHANNEL 环境变量？',
      err,
    );
  }
  return 'GW';
});

export default getChannelName__forWeb;
