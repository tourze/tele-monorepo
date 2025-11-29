import { invoke } from '@tauri-apps/api/core';

async function natCheck__forTauri(stunAddress: string, socks5Address: string) {
  return await invoke('plugin:ttmanager|nat_check', {
    stunAddress,
    socks5Address: socks5Address || null,
  });
}

export default natCheck__forTauri;
