import { useEffect } from 'react';
import callTsJsonRpcAPI from '../../../helpers/callTsJsonRpcAPI';

const useHomeNodeReporter = (
  currentNode: any,
  removeCurrentNode: () => Promise<void>,
) => {
  useEffect(() => {
    if (!currentNode) {
      return;
    }
    callTsJsonRpcAPI('googlePlay89566', { node: currentNode }).catch(async () => {
      await removeCurrentNode();
    });
  }, [currentNode, removeCurrentNode]);
};

export default useHomeNodeReporter;
