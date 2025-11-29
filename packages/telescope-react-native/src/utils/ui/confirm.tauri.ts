import {ask} from '@tauri-apps/plugin-dialog';

async function confirm__forTauri(
  title = '',
  msg = '',
  confirmLabel = '确认',
  cancelLabel = '取消',
) {
  const yes = await ask(msg, {
    title,
    kind: 'info',
    okLabel: confirmLabel,
    cancelLabel,
  });

  if (!yes) {
    throw new Error('cancel');
  }
}

export default confirm__forTauri;
