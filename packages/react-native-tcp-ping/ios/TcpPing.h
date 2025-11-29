#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "TcpPingSpec.h"
@interface TcpPing : RCTEventEmitter <NativeTcpPingSpec>
#else
@interface TcpPing : RCTEventEmitter <RCTBridgeModule>
#endif
@end
