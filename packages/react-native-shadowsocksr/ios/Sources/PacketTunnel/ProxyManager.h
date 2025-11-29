//
//  ProxyManager.h
//  从宿主迁移，供库内部/扩展引用

#import <Foundation/Foundation.h>

typedef void(^GostProxyCompletion)(int port, NSError *error);
typedef void(^HttpProxyCompletion)(int port, NSError *error);
typedef void(^ShadowsocksProxyCompletion)(int port, NSError *error);

extern int sock_port (int fd);

@interface ProxyManager : NSObject

+ (ProxyManager *)sharedManager;
@property (nonatomic, readonly) BOOL socksProxyRunning;
@property (nonatomic, readonly) int socksProxyPort;
@property (nonatomic, readonly) BOOL httpProxyRunning;
@property (nonatomic, readonly) int httpProxyPort;
@property (nonatomic, readonly) BOOL shadowsocksProxyRunning;
@property (nonatomic, readonly) int shadowsocksProxyPort;
- (void)startHttpProxy: (HttpProxyCompletion)completion;
- (void)stopHttpProxy;
- (void)startShadowsocks: (ShadowsocksProxyCompletion)completion;
- (void)stopShadowsocks;
- (void)startGost: (GostProxyCompletion)completion;
- (void)stopGost;
@end

