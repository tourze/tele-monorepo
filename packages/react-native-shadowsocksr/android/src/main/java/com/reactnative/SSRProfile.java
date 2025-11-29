package com.reactnative;

import android.os.Parcel;
import android.os.Parcelable;

import java.util.ArrayList;

// 可序列化的 SSR Profile，用于 AIDL 传输（字段精简，保持与现有 Profile 映射）
public class SSRProfile implements Parcelable {
  public String host = "";
  public int remotePort = 0;
  public String password = "";
  public String method = "";
  public String protocol = "origin";
  public String protocol_param = "";
  public String obfs = "plain";
  public String obfs_param = "";
  public String route = "default-server";
  public boolean udpdns = false;
  public boolean lanOpen = false;
  public boolean ipv6 = false;
  public String dns = "208.67.222.222:53";
  public String china_dns = "114.114.114.114:53,223.5.5.5:53";
  public ArrayList<String> tunAddresses;
  public ArrayList<String> tunRoutes;
  public ArrayList<String> udpServers;
  public ArrayList<String> udpListenIps;
  public ArrayList<Integer> udpListenPorts;
  public ArrayList<String> allowedApps;
  public ArrayList<String> disallowedApps;
  public ArrayList<String> forceProxyHosts;

  public SSRProfile() {}

  protected SSRProfile(Parcel in) {
    host = in.readString();
    remotePort = in.readInt();
    password = in.readString();
    method = in.readString();
    protocol = in.readString();
    protocol_param = in.readString();
    obfs = in.readString();
    obfs_param = in.readString();
    route = in.readString();
    udpdns = in.readByte() != 0;
    lanOpen = in.readByte() != 0;
    ipv6 = in.readByte() != 0;
    dns = in.readString();
    china_dns = in.readString();
    tunAddresses = readStringList(in);
    tunRoutes = readStringList(in);
    udpServers = readStringList(in);
    udpListenIps = readStringList(in);
    udpListenPorts = readIntegerList(in);
    allowedApps = readStringList(in);
    disallowedApps = readStringList(in);
    forceProxyHosts = readStringList(in);
  }

  @Override public void writeToParcel(Parcel dest, int flags) {
    dest.writeString(host);
    dest.writeInt(remotePort);
    dest.writeString(password);
    dest.writeString(method);
    dest.writeString(protocol);
    dest.writeString(protocol_param);
    dest.writeString(obfs);
    dest.writeString(obfs_param);
    dest.writeString(route);
    dest.writeByte((byte) (udpdns ? 1 : 0));
    dest.writeByte((byte) (lanOpen ? 1 : 0));
    dest.writeByte((byte) (ipv6 ? 1 : 0));
    dest.writeString(dns);
    dest.writeString(china_dns);
    writeStringList(dest, tunAddresses);
    writeStringList(dest, tunRoutes);
    writeStringList(dest, udpServers);
    writeStringList(dest, udpListenIps);
    writeIntegerList(dest, udpListenPorts);
    writeStringList(dest, allowedApps);
    writeStringList(dest, disallowedApps);
    writeStringList(dest, forceProxyHosts);
  }

  @Override public int describeContents() { return 0; }

  public static final Creator<SSRProfile> CREATOR = new Creator<SSRProfile>() {
    @Override public SSRProfile createFromParcel(Parcel in) { return new SSRProfile(in); }
    @Override public SSRProfile[] newArray(int size) { return new SSRProfile[size]; }
  };

  private static void writeStringList(Parcel dest, ArrayList<String> data) {
    if (data == null || data.isEmpty()) {
      dest.writeInt(0);
      return;
    }
    dest.writeInt(1);
    dest.writeStringList(data);
  }

  private static ArrayList<String> readStringList(Parcel in) {
    if (in.readInt() == 0) return null;
    ArrayList<String> list = new ArrayList<>();
    in.readStringList(list);
    return list;
  }

  private static void writeIntegerList(Parcel dest, ArrayList<Integer> data) {
    if (data == null || data.isEmpty()) {
      dest.writeInt(0);
      return;
    }
    dest.writeInt(1);
    dest.writeInt(data.size());
    for (Integer value : data) {
      dest.writeInt(value != null ? value : 0);
    }
  }

  private static ArrayList<Integer> readIntegerList(Parcel in) {
    if (in.readInt() == 0) return null;
    int size = in.readInt();
    ArrayList<Integer> list = new ArrayList<>(size);
    for (int i = 0; i < size; i++) {
      list.add(in.readInt());
    }
    return list;
  }
}
