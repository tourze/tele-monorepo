import React from 'react';
import {View} from 'react-native';
import useSizeTransform from '../../../hooks/useSizeTransform';
import NodeFlag from '../../../components/NodeFlag';

function RouteListFlag({flag}) {
  const sizeTransform = useSizeTransform();
  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: sizeTransform(10),
      }}>
      <NodeFlag flag={flag} />
    </View>
  );
}

// 🔥 优化：使用简单值比较替代昂贵的 JSON.stringify
export default React.memo(RouteListFlag, function (prevProps, nextProps) {
  return prevProps.flag === nextProps.flag;
});
