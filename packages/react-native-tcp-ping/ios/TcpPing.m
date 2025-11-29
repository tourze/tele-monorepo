#import "TcpPing.h"
#import <sys/socket.h>
#import <netinet/in.h>
#import <arpa/inet.h>
#import <netdb.h>
#import <fcntl.h>
#import <unistd.h>

static NSString *const kTcpPingBatchEvent = @"TcpPingBatchResult";
static NSInteger const kTcpPingDefaultCount = 4;
static NSInteger const kTcpPingDefaultTimeout = 3000;
static NSInteger const kTcpPingMinTimeout = 100;

@interface TcpPingRequestState : NSObject
@property (nonatomic, assign) NSInteger remaining;
@property (nonatomic, assign) BOOL cancelled;
@end

@implementation TcpPingRequestState
@end

@implementation TcpPing {
  NSMutableDictionary<NSString *, TcpPingRequestState *> *_requestStates;
  dispatch_queue_t _workerQueue;
}

RCT_EXPORT_MODULE(TcpPing);

- (instancetype)init {
  if (self = [super init]) {
    _requestStates = [NSMutableDictionary new];
    _workerQueue = dispatch_queue_create("com.vibeshell.tcpping.batch", DISPATCH_QUEUE_CONCURRENT);
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[kTcpPingBatchEvent];
}

static long tcp_connect_once(const char *host, int port, int timeout_ms) {
  int sockfd = -1;
  struct sockaddr_in serv_addr;
  struct hostent *server;

  server = gethostbyname(host);
  if (server == NULL) {
    return -1;
  }

  sockfd = socket(AF_INET, SOCK_STREAM, 0);
  if (sockfd < 0) return -1;

  memset(&serv_addr, 0, sizeof(serv_addr));
  serv_addr.sin_family = AF_INET;
  serv_addr.sin_port = htons(port);
  memcpy(&serv_addr.sin_addr.s_addr, server->h_addr, server->h_length);

  int flags = fcntl(sockfd, F_GETFL, 0);
  fcntl(sockfd, F_SETFL, flags | O_NONBLOCK);

  struct timeval tv; tv.tv_sec = timeout_ms/1000; tv.tv_usec = (timeout_ms%1000)*1000;

  long start_ms = (long)([[NSDate date] timeIntervalSince1970] * 1000.0);
  int res = connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr));
  if (res < 0) {
    fd_set wfds; FD_ZERO(&wfds); FD_SET(sockfd, &wfds);
    int sel = select(sockfd+1, NULL, &wfds, NULL, &tv);
    if (sel <= 0) { close(sockfd); return -1; }
    int err = 0; socklen_t len = sizeof(err);
    if (getsockopt(sockfd, SOL_SOCKET, SO_ERROR, &err, &len) < 0 || err != 0) { close(sockfd); return -1; }
  }
  long end_ms = (long)([[NSDate date] timeIntervalSince1970] * 1000.0);
  close(sockfd);
  return end_ms - start_ms;
}

static NSNumber * _Nullable tcp_average_time(NSInteger successCount, long sum) {
  if (successCount <= 0) {
    return nil;
  }
  return @(sum / successCount);
}

RCT_REMAP_METHOD(startPing,
                 startPingWithHost:(NSString *)host
                 port:(nonnull NSNumber *)port
                 count:(nonnull NSNumber *)count
                 resolver:(RCTPromiseResolveBlock)resolve
                 rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(_workerQueue, ^{
    NSInteger times = MAX(1, count.integerValue);
    long sum = 0;
    NSInteger ok = 0;

    for (NSInteger i = 0; i < times; i++) {
      long t = tcp_connect_once(host.UTF8String, port.intValue, (int)kTcpPingDefaultTimeout);
      if (t >= 0) { sum += t; ok++; }
    }

    if (ok == 0) {
      resolve((id)kCFNull);
      return;
    }
    resolve(tcp_average_time(ok, sum));
  });
}

RCT_EXPORT_METHOD(startBatchPing:(NSString *)requestId
                  targets:(NSArray<NSDictionary *> *)targets
                  options:(NSDictionary *_Nullable)options)
{
  if (![targets isKindOfClass:[NSArray class]] || targets.count == 0) {
    [self emitCompletionForRequest:requestId cancelled:NO];
    return;
  }

  NSInteger defaultCount = kTcpPingDefaultCount;
  NSInteger defaultTimeout = kTcpPingDefaultTimeout;
  if ([options isKindOfClass:[NSDictionary class]]) {
    NSNumber *countValue = options[@"count"];
    if ([countValue respondsToSelector:@selector(integerValue)]) {
      defaultCount = MAX(1, countValue.integerValue);
    }
    NSNumber *timeoutValue = options[@"timeoutMs"];
    if ([timeoutValue respondsToSelector:@selector(integerValue)]) {
      defaultTimeout = MAX(kTcpPingMinTimeout, timeoutValue.integerValue);
    }
  }

  TcpPingRequestState *state = [TcpPingRequestState new];
  state.remaining = targets.count;
  state.cancelled = NO;

  TcpPingRequestState *previous = nil;
  @synchronized (_requestStates) {
    previous = _requestStates[requestId];
    if (previous != nil) {
      previous.cancelled = YES;
    }
    _requestStates[requestId] = state;
  }
  if (previous != nil) {
    [self emitCompletionForRequest:requestId cancelled:YES];
  }

  for (NSDictionary *item in targets) {
    dispatch_async(_workerQueue, ^{
      if (state.cancelled) {
        return;
      }
      if (![item isKindOfClass:[NSDictionary class]]) {
        [self handleResultForRequest:requestId
                                host:nil
                                port:nil
                        successCount:0
                          totalCount:0
                             avgTime:nil
                               error:@"invalid_target"
                               state:state];
        return;
      }

      NSString *host = item[@"host"];
      if (host == nil || host.length == 0) {
        host = item[@"ip"];
      }
      NSNumber *port = item[@"port"];
      NSNumber *countValue = item[@"count"];
      NSNumber *timeoutValue = item[@"timeoutMs"];

      if (host == nil || host.length == 0 || ![port respondsToSelector:@selector(intValue)]) {
        [self handleResultForRequest:requestId
                                host:host
                                port:port
                        successCount:0
                          totalCount:0
                             avgTime:nil
                               error:@"invalid_target"
                               state:state];
        return;
      }

      NSInteger count = defaultCount;
      if ([countValue respondsToSelector:@selector(integerValue)]) {
        count = MAX(1, countValue.integerValue);
      }
      NSInteger timeout = defaultTimeout;
      if ([timeoutValue respondsToSelector:@selector(integerValue)]) {
        timeout = MAX(kTcpPingMinTimeout, timeoutValue.integerValue);
      }

      long sum = 0;
      NSInteger ok = 0;
      for (NSInteger i = 0; i < count; i++) {
        if (state.cancelled) {
          return;
        }
        long t = tcp_connect_once(host.UTF8String, port.intValue, (int)timeout);
        if (t >= 0) { sum += t; ok++; }
      }

      NSNumber *avg = tcp_average_time(ok, sum);
      [self handleResultForRequest:requestId
                              host:host
                              port:port
                      successCount:ok
                        totalCount:count
                           avgTime:avg
                             error:nil
                             state:state];
    });
  }
}

RCT_EXPORT_METHOD(stopBatchPing:(NSString *)requestId)
{
  TcpPingRequestState *state = nil;
  @synchronized (_requestStates) {
    state = _requestStates[requestId];
    if (state != nil) {
      state.cancelled = YES;
      [_requestStates removeObjectForKey:requestId];
    }
  }
  if (state != nil) {
    [self emitCompletionForRequest:requestId cancelled:YES];
  }
}

- (void)handleResultForRequest:(NSString *)requestId
                          host:(NSString *_Nullable)host
                          port:(NSNumber *_Nullable)port
                  successCount:(NSInteger)successCount
                    totalCount:(NSInteger)totalCount
                       avgTime:(NSNumber *_Nullable)avgTime
                         error:(NSString *_Nullable)error
                         state:(TcpPingRequestState *)state
{
  BOOL shouldEmit = NO;
  BOOL done = NO;
  @synchronized (state) {
    if (!state.cancelled) {
      state.remaining -= 1;
      shouldEmit = YES;
      if (state.remaining <= 0) {
        done = YES;
      }
    }
  }

  if (!shouldEmit) {
    return;
  }

  if (done) {
    @synchronized (_requestStates) {
      [_requestStates removeObjectForKey:requestId];
    }
  }

  [self emitResultWithRequestId:requestId
                           host:host
                           port:port
                   successCount:successCount
                     totalCount:totalCount
                        avgTime:avgTime
                          error:error
                           done:done
                      cancelled:NO];
}

- (void)emitResultWithRequestId:(NSString *)requestId
                           host:(NSString *_Nullable)host
                           port:(NSNumber *_Nullable)port
                   successCount:(NSInteger)successCount
                     totalCount:(NSInteger)totalCount
                        avgTime:(NSNumber *_Nullable)avgTime
                          error:(NSString *_Nullable)error
                           done:(BOOL)done
                      cancelled:(BOOL)cancelled
{
  NSMutableDictionary *payload = [NSMutableDictionary dictionary];
  payload[@"requestId"] = requestId ?: @"";
  payload[@"host"] = host != nil ? host : (id)kCFNull;
  payload[@"port"] = port != nil ? port : (id)kCFNull;
  payload[@"totalCount"] = @(totalCount);
  payload[@"successCount"] = @(successCount);
  payload[@"done"] = @(done);
  payload[@"cancelled"] = @(cancelled);
  payload[@"success"] = @((successCount > 0) && error == nil && !cancelled);
  if (avgTime != nil) {
    payload[@"avgTime"] = avgTime;
  } else {
    payload[@"avgTime"] = (id)kCFNull;
  }
  if (error != nil) {
    payload[@"error"] = error;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    [self sendEventWithName:kTcpPingBatchEvent body:payload];
  });
}

- (void)emitCompletionForRequest:(NSString *)requestId cancelled:(BOOL)cancelled {
  [self emitResultWithRequestId:requestId
                           host:nil
                           port:nil
                   successCount:0
                     totalCount:0
                        avgTime:nil
                          error:nil
                           done:YES
                      cancelled:cancelled];
}

@end
