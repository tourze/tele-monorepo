// IShadowsocksService.aidl
package com.reactnative;

// Declare any non-default types here with import statements
import com.reactnative.IShadowsocksServiceCallback;
import com.reactnative.SSRProfile;

interface IShadowsocksService {
  int getState();
  String getProfileName();

  oneway void registerCallback(IShadowsocksServiceCallback cb);
  oneway void unregisterCallback(IShadowsocksServiceCallback cb);

  oneway void use(in int profileId);
  void useSync(in int profileId);

  // 新增：直接使用 Parcelable Profile 进行跨进程传参
  oneway void useProfile(in SSRProfile profile);
}
