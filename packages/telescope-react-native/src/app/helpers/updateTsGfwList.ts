import getDataDir from '../../utils/file/getDataDir';
import callTsJsonRpcAPI from './callTsJsonRpcAPI';
import getStorageItem from '../../utils/storage/getStorageItem';
import Tracking from '../../utils/tracking/Tracking';
import setStorageItem from '../../utils/storage/setStorageItem';
import removeStorageItem from '../../utils/storage/removeStorageItem';
import writeTextFile from '../../utils/file/writeTextFile';
import sendGetRequest from '../../utils/http/sendGetRequest';
import { trimEnd } from 'lodash';

/**
 * 更新GFWList文件
 *
 * @returns {Promise<void>}
 */
async function updateTsGfwList() {
  await removeStorageItem('gfwCurrentUse'); // 测试
  let currentVersion: string = await getStorageItem('gfwCurrentUse');
  if (!currentVersion) {
    currentVersion = '0';
  }
  // TODO 如果对应的文件不存在的话，那么我们也要清空并重新获取
  let remoteFile = null;
  let aclFile = null;

  try {
    // GetStarHomeGfwList
    const res = await callTsJsonRpcAPI('sina_dev', {
      oldVersion: currentVersion,
    });
    // {
    //     "code": 200,
    //     "data": {
    //         "fileUrl": "https://api.quickg.vip/upload/1683390833_app.acl",
    //         "version": 130
    //     },
    //     "message": "加载成功",
    //     "status": "success"
    // }
    const nextVersion = res.version;
    if (nextVersion > parseInt(currentVersion, 10) && res.fileUrl) {
      remoteFile = res.fileUrl;
      await setStorageItem('gfwCurrentUse', `${nextVersion}`);

      const data = await sendGetRequest(remoteFile);
      if (data === null) {
        throw new Error('ACL文件下载失败');
      }

      const dataDir = trimEnd(await getDataDir(), '/');
      aclFile = `${dataDir}/default-server.acl`;

      // 先删除，再新建
      writeTextFile(aclFile, data)
        .then(async () => {
          await setStorageItem('ACL_FILE', aclFile);
          Tracking.info('ACL文件更新成功', {
            fileUrl: res.fileUrl,
            aclFile,
          });
        })
        .catch(err => {
          Tracking.info('ACL文件更新失败', {
            fileUrl: res.fileUrl,
            error: `${err}`,
            aclFile,
          });
        });
    }
  } catch (e) {
    Tracking.info('更新ACL文件失败', {
      error: `${e}`,
      currentVersion,
      remoteFile,
      aclFile,
    });
  }
}

export default updateTsGfwList;
