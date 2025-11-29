import {info} from '@tauri-apps/plugin-log';

async function setTrackingUserId__forTauri(id: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    window.newrelic !== undefined && window.newrelic.setUserId(id);
  } catch (err) { /* empty */ }

  info(`setTrackingUserId: ${id}`);
}

export default setTrackingUserId__forTauri;
