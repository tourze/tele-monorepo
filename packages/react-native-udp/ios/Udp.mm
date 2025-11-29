#import "Udp.h"

#import <CocoaAsyncSocket/GCDAsyncUdpSocket.h>
#import <arpa/inet.h>
#import <netinet/in.h>
#import <sys/socket.h>
#import <React/RCTConvert.h>
#import <React/RCTLog.h>

static NSString *const kUdpEventMessage = @"udpOnMessage";

@interface UdpSocketEntry : NSObject
@property (nonatomic, copy) NSString *socketId;
@property (nonatomic, strong) GCDAsyncUdpSocket *socket;
@property (nonatomic, strong) dispatch_queue_t queue;
@end

@implementation UdpSocketEntry
@end

@interface Udp () <GCDAsyncUdpSocketDelegate>
@property (nonatomic, strong) NSMutableDictionary<NSString *, UdpSocketEntry *> *sockets;
@property (nonatomic, assign) BOOL hasListeners;
@end

@implementation Udp

RCT_EXPORT_MODULE(Udp);

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

- (instancetype)init
{
  if (self = [super init]) {
    _sockets = [NSMutableDictionary dictionary];
    _hasListeners = NO;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[kUdpEventMessage];
}

- (void)startObserving
{
  self.hasListeners = YES;
}

- (void)stopObserving
{
  self.hasListeners = NO;
}

- (void)invalidate
{
  [super invalidate];
  [self closeAllSockets];
}

RCT_REMAP_METHOD(createSocket,
                 createSocketWithConfig:(NSDictionary *)config
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *socketId = [RCTConvert NSString:config[@"socketId"]];
  if (socketId.length == 0) {
    socketId = [[NSUUID UUID] UUIDString];
  }

  UdpSocketEntry *existing = self.sockets[socketId];
  if (existing) {
    [self closeEntry:existing];
    [self.sockets removeObjectForKey:socketId];
  }

  NSString *localAddress = [RCTConvert NSString:config[@"localAddress"]];
  NSNumber *localPortNumber = [RCTConvert NSNumber:config[@"localPort"]];
  BOOL reusePort = [RCTConvert BOOL:config[@"reusePort"]];
  BOOL reuseAddress = [RCTConvert BOOL:config[@"reuseAddress"]];
  uint16_t localPort = localPortNumber != nil ? localPortNumber.unsignedShortValue : 0;

  dispatch_queue_t queue = dispatch_queue_create([[NSString stringWithFormat:@"com.vibeshell.udp.%@", socketId] UTF8String], DISPATCH_QUEUE_SERIAL);
  GCDAsyncUdpSocket *socket = [[GCDAsyncUdpSocket alloc] initWithDelegate:self delegateQueue:queue];

  NSError *error = nil;
  if (reuseAddress || reusePort) {
    if (![socket enableReusePort:YES error:&error]) {
      RCTLogWarn(@"[react-native-udp] enableReusePort 失败: %@", error);
      error = nil;
    }
    if (![socket enableBroadcast:YES error:&error]) {
      error = nil;
    }
    if (![socket enableReuseAddress:YES error:&error]) {
      error = nil;
    }
  }

  BOOL bindSuccess = NO;
  if (localAddress.length > 0) {
    NSData *addressData = UdpCreateSockaddrData(localAddress, localPort);
    if (addressData) {
      bindSuccess = [socket bindToAddress:addressData error:&error];
    }
  }
  if (!bindSuccess) {
    bindSuccess = [socket bindToPort:localPort interface:nil error:&error];
  }
  if (!bindSuccess || error) {
    [socket close];
    reject(@"udp_bind_error", error.localizedDescription ?: @"bind failed", error);
    return;
  }

  if (![socket beginReceiving:&error]) {
    [socket close];
    reject(@"udp_receive_error", error.localizedDescription ?: @"beginReceiving failed", error);
    return;
  }

  UdpSocketEntry *entry = [UdpSocketEntry new];
  entry.socketId = socketId;
  entry.socket = socket;
  entry.queue = queue;
  self.sockets[socketId] = entry;

  resolve(socketId);
}

RCT_REMAP_METHOD(send,
                 sendWithId:(NSString *)socketId
                 dataBase64:(NSString *)dataBase64
                 host:(NSString *)host
                 port:(nonnull NSNumber *)port
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UdpSocketEntry *entry = self.sockets[socketId];
  if (!entry) {
    reject(@"udp_missing_socket", [NSString stringWithFormat:@"socket not found: %@", socketId], nil);
    return;
  }
  NSData *payload = [[NSData alloc] initWithBase64EncodedString:dataBase64 options:NSDataBase64DecodingIgnoreUnknownCharacters];
  if (!payload) {
    reject(@"udp_data_error", @"invalid base64 payload", nil);
    return;
  }
  uint16_t targetPort = (uint16_t)port.unsignedIntValue;
  [entry.socket sendData:payload toHost:host port:targetPort withTimeout:-1 tag:0];
  resolve(nil);
}

RCT_REMAP_METHOD(close,
                 closeWithId:(NSString *)socketId
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  UdpSocketEntry *entry = self.sockets[socketId];
  if (entry) {
    [self closeEntry:entry];
    [self.sockets removeObjectForKey:socketId];
  }
  resolve(nil);
}

RCT_REMAP_METHOD(closeAll,
                 closeAllWithResolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  [self closeAllSockets];
  resolve(nil);
}

RCT_EXPORT_METHOD(addListener:(NSString *)eventName)
{
  // React Native 事件机制要求存在该方法
}

RCT_EXPORT_METHOD(removeListeners:(double)count)
{
  // React Native 事件机制要求存在该方法
}

- (void)closeEntry:(UdpSocketEntry *)entry
{
  [entry.socket close];
}

- (void)closeAllSockets
{
  NSArray<UdpSocketEntry *> *entries = self.sockets.allValues;
  [self.sockets removeAllObjects];
  for (UdpSocketEntry *entry in entries) {
    [self closeEntry:entry];
  }
}

- (void)udpSocket:(GCDAsyncUdpSocket *)sock didReceiveData:(NSData *)data fromAddress:(NSData *)address withFilterContext:(id)filterContext
{
  if (!self.hasListeners) {
    return;
  }
  NSString *socketId = [self socketIdForSocket:sock];
  if (socketId.length == 0) {
    return;
  }
  NSString *host = [GCDAsyncUdpSocket hostFromAddress:address] ?: @"";
  uint16_t port = [GCDAsyncUdpSocket portFromAddress:address];
  NSString *base64 = [data base64EncodedStringWithOptions:0] ?: @"";

  [self sendEventWithName:kUdpEventMessage
                     body:@{
                       @"socketId": socketId,
                       @"remoteAddress": host,
                       @"remotePort": @(port),
                       @"dataBase64": base64,
                       @"length": @(data.length)
                     }];
}

- (NSString *)socketIdForSocket:(GCDAsyncUdpSocket *)socket
{
  __block NSString *found = nil;
  [self.sockets enumerateKeysAndObjectsUsingBlock:^(NSString *key, UdpSocketEntry *obj, BOOL *stop) {
    if (obj.socket == socket) {
      found = key;
      *stop = YES;
    }
  }];
  return found;
}

#ifdef RCT_NEW_ARCH_ENABLED
- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
  (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeUdpSpecJSI>(params);
}
#endif

@end
static NSData *UdpCreateSockaddrData(NSString *host, uint16_t port) {
  if (host.length == 0) {
    return nil;
  }

  struct sockaddr_in6 addr6;
  memset(&addr6, 0, sizeof(addr6));
  addr6.sin6_len = sizeof(addr6);
  addr6.sin6_family = AF_INET6;
  addr6.sin6_port = htons(port);

  if (inet_pton(AF_INET6, host.UTF8String, &addr6.sin6_addr) == 1) {
    return [NSData dataWithBytes:&addr6 length:sizeof(addr6)];
  }

  struct sockaddr_in addr4;
  memset(&addr4, 0, sizeof(addr4));
  addr4.sin_len = sizeof(addr4);
  addr4.sin_family = AF_INET;
  addr4.sin_port = htons(port);

  if (inet_pton(AF_INET, host.UTF8String, &addr4.sin_addr) == 1) {
    return [NSData dataWithBytes:&addr4 length:sizeof(addr4)];
  }

  return nil;
}
