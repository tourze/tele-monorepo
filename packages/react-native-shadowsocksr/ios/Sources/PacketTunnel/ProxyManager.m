//
//  ProxyManager.m
//  从宿主迁移，供库内部/扩展引用

#import "ProxyManager.h"
#import <ShadowPath/ShadowPath.h>
#import "ShadowBase.h"

@interface ProxyManager ()
@property (nonatomic) BOOL httpProxyRunning;
@property (nonatomic) int httpProxyPort;
@property (nonatomic) BOOL shadowsocksProxyRunning;
@property (nonatomic) int shadowsocksProxyPort;
@property (nonatomic) BOOL gostProxyRunning;
@property (nonatomic) int gostProxyPort;
@property (nonatomic, copy) HttpProxyCompletion httpCompletion;
@property (nonatomic, copy) ShadowsocksProxyCompletion shadowsocksCompletion;
@property (nonatomic, copy) GostProxyCompletion gostCompletion;

- (void)onHttpProxyCallback: (int)fd;
- (void)onShadowsocksCallback:(int)fd;
- (void)onGostCallback:(int)fd;
@end

void http_proxy_handler(int fd, void *udata) {
    ProxyManager *provider = (__bridge ProxyManager *)udata;
    [provider onHttpProxyCallback:fd];
}
void shadowsocks_handler(int fd, void *udata) {
    ProxyManager *provider = (__bridge ProxyManager *)udata;
    [provider onShadowsocksCallback:fd];
}
void gost_handler(int fd, void *udata) {
    ProxyManager *provider = (__bridge ProxyManager *)udata;
    [provider onGostCallback:fd];
}

int sock_port (int fd) {
    struct sockaddr_in sin;
    socklen_t len = sizeof(sin);
    if (getsockname(fd, (struct sockaddr *)&sin, &len) < 0) {
        NSLog(@"getsock_port(%d) error: %s", fd, strerror (errno));
        return 0;
    } else {
        return ntohs(sin.sin_port);
    }
}

@implementation ProxyManager

+ (ProxyManager *)sharedManager {
    static dispatch_once_t onceToken;
    static ProxyManager *manager;
    dispatch_once(&onceToken, ^{ manager = [ProxyManager new]; });
    return manager;
}

#pragma mark - Shadowsocks

- (void)startShadowsocks: (ShadowsocksProxyCompletion)completion {
    self.shadowsocksCompletion = [completion copy];
    [NSThread detachNewThreadSelector:@selector(_startShadowsocks) toTarget:self withObject:nil];
}

- (void)_startShadowsocks {
    NSString *confContent = [NSString stringWithContentsOfURL:[Shadow sharedProxyConfUrl] encoding:NSUTF8StringEncoding error:nil];
    NSDictionary *json = [confContent jsonDictionary];
    NSString *host = json[@"host"];
    NSNumber *port = json[@"port"];
    NSString *password = json[@"password"];
    NSString *authscheme = json[@"authscheme"];
    NSString *protocol = json[@"protocol"];
    NSString *protocol_param = json[@"protocolParam"];
    NSString *obfs = json[@"obfs"];
    NSString *obfs_param = json[@"obfs_param"];
    BOOL ota = [json[@"ota"] boolValue];
    if (host && port && password && authscheme) {
        profile_t profile; memset(&profile, 0, sizeof(profile_t));
        profile.remote_host = strdup([host UTF8String]);
        profile.remote_port = [port intValue];
        profile.password = strdup([password UTF8String]);
        profile.method = strdup([authscheme UTF8String]);
        profile.local_addr = "127.0.0.1";
        profile.local_port = 0; profile.timeout = 600; profile.auth = ota;
        NSString *proxyMode = [[Shadow sharedUserDefaults] objectForKey: @"ProxyModeType"];
        if (proxyMode != nil && [proxyMode isEqualToString: @"China Out"]) {
            profile.acl = strdup([[[Shadow sharedDefaultAclUrl] path] UTF8String]);
        }
#if DEBUG
        NSString *logFilePath = [Shadow sharedSSRLogUrl].path;
        if (![[NSFileManager defaultManager] fileExistsAtPath:logFilePath]) {
            [[NSFileManager defaultManager] createFileAtPath:logFilePath contents:nil attributes:nil];
        } else {
            NSError *error = nil; [@"" writeToFile:logFilePath atomically:YES encoding:NSUTF8StringEncoding error:&error];
        }
        profile.log = strdup([logFilePath UTF8String]); profile.verbose = 1;
#endif
        if (protocol.length > 0) profile.protocol = strdup([protocol UTF8String]);
        if (protocol_param.length > 0) profile.protocol_param = strdup([protocol_param UTF8String]);
        if (obfs.length > 0) profile.obfs = strdup([obfs UTF8String]);
        if (obfs_param.length > 0) profile.obfs_param = strdup([obfs_param UTF8String]);
        start_ss_local_server(profile, shadowsocks_handler, (__bridge void *)self);
    } else { if (self.shadowsocksCompletion) self.shadowsocksCompletion(0, nil); return; }
}

- (void)stopShadowsocks { /* 占位 */ }

- (void)onShadowsocksCallback:(int)fd {
    NSError *error; if (fd > 0) { self.shadowsocksProxyPort = sock_port(fd); self.shadowsocksProxyRunning = YES; }
    else { error = [NSError errorWithDomain:[[NSBundle mainBundle] bundleIdentifier] code:100 userInfo:@{NSLocalizedDescriptionKey: @"Fail to start ssr proxy"}]; }
    if (self.shadowsocksCompletion) self.shadowsocksCompletion(self.shadowsocksProxyPort, error);
}

#pragma mark - Gost

- (void)startGost: (GostProxyCompletion)completion { self.gostCompletion = [completion copy]; [NSThread detachNewThreadSelector:@selector(_startGost) toTarget:self withObject:nil]; }
- (void)_startGost { /* 占位（保留接口）*/ }
- (void)stopGost { /* 占位 */ }
- (void)onGostCallback:(int)fd { if (self.gostCompletion) self.gostCompletion(self.shadowsocksProxyPort, nil); }

#pragma mark - Http Proxy

- (void)startHttpProxy:(HttpProxyCompletion)completion { self.httpCompletion = [completion copy]; [NSThread detachNewThreadSelector:@selector(_startHttpProxy:) toTarget:self withObject:[Shadow sharedHttpProxyConfUrl]]; }
- (void)_startHttpProxy: (NSURL *)confURL {
    struct forward_spec *proxy = NULL;
    if (self.shadowsocksProxyPort > 0) {
        proxy = (malloc(sizeof(struct forward_spec))); memset(proxy, 0, sizeof(struct forward_spec)); proxy->type = SOCKS_5;
        NSString *p2sIp = [[Shadow sharedUserDefaults] objectForKey: @"P2S_IP"];
        if ([Shadow isBlankString:p2sIp] == NO) { NSInteger p2sPort = [[[Shadow sharedUserDefaults] objectForKey: @"P2S_PORT"] integerValue]; proxy->gateway_host = strdup([p2sIp UTF8String]); proxy->gateway_port = (int)p2sPort; }
        else { proxy->gateway_host = "127.0.0.1"; proxy->gateway_port = self.shadowsocksProxyPort; }
    }
    shadowpath_main(strdup([[confURL path] UTF8String]), proxy, http_proxy_handler, (__bridge void *)self);
}
- (void)stopHttpProxy { /* 占位 */ }
- (void)onHttpProxyCallback:(int)fd { if (self.httpCompletion) self.httpCompletion(sock_port(fd), nil); }

@end

