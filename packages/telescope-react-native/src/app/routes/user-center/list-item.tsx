import React from 'react';
import isString from 'lodash/isString';
import {ListItem} from '../../../react-native-ui-kitten/components';
import {Image, View} from 'react-native';
import useSizeTransform from '../../../hooks/useSizeTransform';
import usePathRedirect from '../../helpers/usePathRedirect';
import { useDebounceFn } from 'ahooks';

function UserCenterListItem({item, onClick = null}) {
  const sizeTransform = useSizeTransform();
  const pathRedirect = usePathRedirect();

  const clickItem = useDebounceFn(async () => {
    await pathRedirect(item);
  }, { leading: true, trailing: false });

  return (
    <View
      style={{
        paddingLeft: sizeTransform(6),
      }}>
      <ListItem
        title={item.title}
        accessoryLeft={() => {
          return (
            <Image
              source={isString(item.thumb1) ? {
                uri: item.thumb1,
              } : item.thumb1}
              fadeDuration={0}
              style={{
                width: 24,
                height: 24,
                marginRight: 2,
              }}
            />
          );
        }}
        onPress={onClick !== null ? onClick : clickItem.run}
      />
    </View>
  );
}

export default React.memo(UserCenterListItem);
