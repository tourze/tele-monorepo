#import <Foundation/Foundation.h>
#import "SSRManager.h"
#if __has_include("QNNTcpPing.h")
#import "QNNTcpPing.h"
#define SSR_HAS_QNN 1
#else
#define SSR_HAS_QNN 0
#endif
#import <FCUUID/FCUUID.h>
#import <HappyDNS/HappyDNS.h>

#if __has_include("ShadowsocksR-Swift.h")
#import "ShadowsocksR-Swift.h"
#endif

@implementation SSRManager

RCT_EXPORT_MODULE(ShadowsocksR);

- (dispatch_queue_t)methodQueue { return dispatch_get_main_queue(); }

RCT_EXPORT_METHOD(setProxyMode:(NSInteger)mode) {
#ifdef __has_include
  if ([Manager respondsToSelector:@selector(sharedManager)]) {
    [[Manager sharedManager] setProxyModeWithMode:mode];
  }
#endif
}

RCT_EXPORT_METHOD(connectVPN:(NSDictionary *)data resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
#ifdef __has_include
  if (![Manager respondsToSelector:@selector(sharedManager)]) {
    reject(@"connectVPN", @"Manager not available", nil);
    return;
  }
  id nodeDic = data[@"node"];
  if (nodeDic && [nodeDic isKindOfClass:[NSDictionary class]]) {
    NodeModel *nodeModel = [[NodeModel alloc] initWithDic:nodeDic];
    [[Manager sharedManager] setSelectNode:nodeModel];
    [[Manager sharedManager] setChangeProxy:true];
  }
  [[Manager sharedManager] stopVPN];
  [[Manager sharedManager] setDefaultConfigGroup];
  [[Manager sharedManager] switchVPN:^(NETunnelProviderManager * _Nullable manager, NSError * _Nullable error) {
    [[Manager sharedManager] setChangeProxy:false];
    if (manager) {
      resolve(@{ @"isConnected": @"ok" });
    } else {
      reject(@"connectVPN", @"Error connecting VPN", error);
    }
  }];
#else
  reject(@"connectVPN", @"Manager header not found", nil);
#endif
}

RCT_EXPORT_METHOD(stopVPN)
{
#ifdef __has_include
  if ([Manager respondsToSelector:@selector(sharedManager)]) {
    dispatch_async(dispatch_get_main_queue(), ^{ [[Manager sharedManager] stopVPN]; [[Manager sharedManager] setSelectNode:nil]; });
  }
#endif
}

RCT_EXPORT_METHOD(vpnStatus:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
#ifdef __has_include
  if ([Manager respondsToSelector:@selector(sharedManager)]) {
    resolve(@{ @"isConnected": @([[Manager sharedManager] isVpnConnected]), @"statusText": [[Manager sharedManager] getVpnStatusText] });
    return;
  }
#endif
  resolve(@{ @"isConnected": @(NO), @"statusText": @"unknown" });
}

RCT_EXPORT_METHOD(getHardwareUUID:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject)
{
  @try { resolve([FCUUID uuidForDevice]); }
  @catch (NSException *exception) {
    NSError *error = [NSError errorWithDomain:@"FCUUIDModule" code:0 userInfo:@{NSLocalizedDescriptionKey: exception.reason ?: @"exception"}];
    reject(@"no_uuid", @"There was no UUID found for the device", error);
  }
}

RCT_EXPORT_METHOD(startPing:(NSString *)host port:(NSInteger)port count:(NSInteger)count resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  if (SSR_HAS_QNN) {
    QNNTcpPing *ping = [QNNTcpPing start:host port:port count:count output:nil complete:^(QNNTcpPingResult *result) {
      resolve(@{ @"code": @(result.code), @"ip": result.ip ?: @"", @"maxTime": @(result.maxTime), @"minTime": @(result.minTime), @"avgTime": @(result.avgTime), @"loss": @(result.loss), @"count": @(result.count), @"totalTime": @(result.totalTime), @"stddev": @(result.stddev) });
    }];
    if (ping == nil) { reject(@"-1", @"start ping failed", nil); }
  } else {
    reject(@"-2", @"QNNTcpPing not available", nil);
  }
}

RCT_EXPORT_METHOD(setConfig:(NSString *)key value:(NSString *)value) {
  [[NSUserDefaults standardUserDefaults] setObject:value forKey:key];
  [[NSUserDefaults standardUserDefaults] synchronize];
}

RCT_EXPORT_METHOD(getConfig:(NSString *)key resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  id v = [[NSUserDefaults standardUserDefaults] objectForKey:key];
  if (v) resolve(v); else reject(@"error", @"Cannot find the key", nil);
}

RCT_EXPORT_METHOD(getVersionCode:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
  NSNumber *code = info[@"CFBundleVersion"]; if (code) resolve(code); else reject(@"GetVersionCodeError", @"Could not get version code", nil);
}

RCT_EXPORT_METHOD(getVersionName:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
  NSString *ver = info[@"CFBundleShortVersionString"]; if (ver) resolve(ver); else reject(@"GetVersionNameError", @"Could not get version name", nil);
}

RCT_EXPORT_METHOD(getChannelName:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
  NSString *path = [[NSBundle mainBundle] pathForResource:@"channel" ofType:@""];
  NSData *data = [[NSFileManager defaultManager] contentsAtPath:path];
  NSString *channel = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
  if (channel) resolve([channel stringByTrimmingCharactersInSet:[NSCharacterSet whitespaceAndNewlineCharacterSet]]);
  else reject(@"GetChannelError", @"Could not get channel", nil);
}

RCT_EXPORT_METHOD(getAppInfo:(RCTResponseSenderBlock)callback) {
  callback(@[[NSNull null], [[NSBundle mainBundle] infoDictionary] ?: @{}]);
}

RCT_EXPORT_METHOD(exitApp) { exit(0); }

@end
