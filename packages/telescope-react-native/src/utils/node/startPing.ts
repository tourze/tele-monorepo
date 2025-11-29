// 通用平台占位：转发到包裹库（该库在非 iOS/Android 平台会返回 null）
import { startPing as startPingBase } from 'react-native-tcp-ping';

export default startPingBase;
