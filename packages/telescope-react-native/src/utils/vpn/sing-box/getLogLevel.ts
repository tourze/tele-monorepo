import getStorageItem from '../../storage/getStorageItem';

async function getLogLevel() {
  let level;
  try {
    level = await getStorageItem('LOG_LEVEL');
  } catch (error) {
    level = 'error';
  }

  try {
    if (await getStorageItem('detailLog')) {
      level = 'debug';
    }
  } catch (error) {
    // do nothing
  }

  // trace debug info warn error fatal panic
  return level ? level : 'error';
}

export default getLogLevel;
