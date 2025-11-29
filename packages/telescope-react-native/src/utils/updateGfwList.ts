import Tracking from './tracking/Tracking';
import callAPI from './http/callAPI';
import getStorageItem from './storage/getStorageItem';
import setStorageItem from './storage/setStorageItem';
import getDataDir from './file/getDataDir';
import writeTextFile from './file/writeTextFile';

/**
 * 更新GFWList文件
 */
async function updateGfwList() {
  //await removeStorageItem('gfwCurrentUse'); // 测试
  let currentVersion: any = await getStorageItem('gfwCurrentUse');
  if (!currentVersion) {
    currentVersion = 0;
  }
  currentVersion = parseInt(currentVersion, 10);
  // TODO 如果对应的文件不存在的话，那么我们也要清空并重新获取

  try {
    const res = await callAPI('GetGaleBoostGfwList', {
      oldVersion: currentVersion,
    });
    const nextVersion = res.version;
    if (nextVersion > currentVersion && res.content) {
      await setStorageItem('gfwCurrentUse', `${nextVersion}`);

      const dataDir = await getDataDir();
      const aclFile = `${dataDir}/default-server.acl`;

      try {
        await writeTextFile(aclFile, res.content);
        Tracking.info('ACL文件更新成功', {
          aclFile,
        });
        await setStorageItem('ACL_FILE', aclFile);
      } catch (error: any) {
        Tracking.info('ACL文件更新失败', {
          error,
          aclFile,
        });
      }
    }
  } catch (error: any) {
    Tracking.info('更新ACL文件失败', {
      error,
    });
  }
}

export default updateGfwList;
