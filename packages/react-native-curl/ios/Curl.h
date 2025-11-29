#import <React/RCTBridgeModule.h>

#ifdef RCT_NEW_ARCH_ENABLED
#import "CurlSpec.h"
@interface Curl : NSObject <NativeCurlSpec>
#else
@interface Curl : NSObject <RCTBridgeModule>
#endif
@end
