package com.shadow.ssrclient.util;

/**
 * 子网掩码 https://www.jianshu.com/p/182317906117
 */
public class DxIfconfig {
    public String inetAddr; // ip
    public String bcast;    // gateway
    public String mask;     // netmask

    public boolean isBlank() {
        return (inetAddr == null && bcast == null && mask == null);
    }

    public boolean isNotBlank() {
        return !isBlank();
    }
}
