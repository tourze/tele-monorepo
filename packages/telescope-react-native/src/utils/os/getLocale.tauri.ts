import { locale } from '@tauri-apps/plugin-os';

const getLocale_forWeb = async function () {
  const res = await locale();
  return res || '';
};

export default getLocale_forWeb;
