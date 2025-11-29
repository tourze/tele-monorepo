import sleep from '@anmiles/sleep';
import {useNavigation} from '@react-navigation/core';
import {useSafeState} from 'ahooks';
import isEmpty from 'lodash/isEmpty';
import React, {Fragment, useCallback, useEffect, useMemo} from 'react';

import Divider from '../../../components/Divider';
import useStorage, {set} from '../../../hooks/useStorage';
import {ListItem} from '../../../react-native-ui-kitten/components';
import debounceClick from '../../../utils/debounceClick';
import Tracking from '../../../utils/tracking/Tracking';

import RouteListFlag from './Flag';
import RouteListInfo from './Info';


function RouteListItem({item, selected, speed}) {
  const {remove: removeCurrentNode, update: updateCurrentNode} = useStorage(
    'currentNode',
    null,
  );
  const [title, setTitle] = useSafeState('');
  // 🔥 优化：speed 现在通过 props 传递，不再独立监听 storage
  const navigation: any = useNavigation();

  useEffect(() => {
    let _title = item.name;
    if (!isEmpty(item.label) && item.label !== null && item.label !== 'null') {
      _title = `${item.name}(${item.label})`;
    }
    setTitle(_title);
  }, [item.name, item.label]);

  const ItemFlag = useMemo(() => {
    return <RouteListFlag flag={item.flag} />;
  }, [item.flag]);

  const ItemInfo = useMemo(() => {
    // console.log('speed', item, speed);
    return <RouteListInfo node={item} speed={speed} selected={selected} />;
  }, [item, speed, selected]);

  const switchRoute = useCallback(
    debounceClick(async () => {
      if (selected) {
        // await remove('currentNode');
        await removeCurrentNode();
        return;
      }

      // 先返回，停顿500ms后再更新，这样可以减少不必要的渲染
      navigation.pop();
      Tracking.info('线路列表，选择线路', item);
      await sleep(500);

      // await set('currentNode', node);
      await updateCurrentNode(item);
      await set('homeReconnect', true);
    }),
    [item],
  );

  return (
    <Fragment key={`${item.id}`}>
      <ListItem
        title={title}
        accessoryLeft={ItemFlag}
        accessoryRight={ItemInfo}
        onPress={switchRoute}
      />
      <Divider />
    </Fragment>
  );
}

RouteListItem.whyDidYouRender = true;

export default React.memo(RouteListItem, function (prevProps, nextProps) {
  // 🔥 优化：添加 speed 的浅比较，并优化比较逻辑
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.name === nextProps.item.name &&
    prevProps.item.ip === nextProps.item.ip &&
    prevProps.item.port === nextProps.item.port &&
    prevProps.selected === nextProps.selected &&
    prevProps.speed === nextProps.speed
  );
});
