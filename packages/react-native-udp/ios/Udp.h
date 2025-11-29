#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "UdpSpec.h"
@interface Udp : RCTEventEmitter <NativeUdpSpec>
#else
@interface Udp : RCTEventEmitter <RCTBridgeModule>
#endif
@end
