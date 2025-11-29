package com.shadow.ssrclient.util;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.LinkProperties;
import android.net.Network;
import android.os.Build;
import android.util.Log;

import androidx.annotation.RequiresApi;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.InetAddress;
import java.net.InterfaceAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Enumeration;
import java.util.List;

/**
 * 获取子网掩码
 *
 * @link https://dingxianye.me/2019/04/03/GetAndroidNetworkMask/
 */
public class DxNetworkUtil {
    private static final String TAG = "DxNetworkUtil";

    public static List<DxIfconfig> getIfconfig() {
        String[] commandLine = new String[]{
                "ifconfig"
        };

        List<DxIfconfig> ifconfigs = new ArrayList<>();

        try {
            Process process = Runtime.getRuntime().exec(commandLine);
            BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(process.getInputStream()));

            DxIfconfig conf = new DxIfconfig();
            do {
                String line = bufferedReader.readLine();
                if (line == null) {
                    break;
                }

                line = "";

                if (line.matches("\\s*|\\t|\\r|\\n")) {
                    if (conf.isNotBlank()) {
                        ifconfigs.add(conf);
                        conf = new DxIfconfig();
                    }
                } else if (line.trim().matches("inet addr:(\\d{1,3}\\.){3}\\d{1,3}( ){2}" +
                        "(Bcast:(\\d{1,3}\\.){3}\\d{1,3}( ){2}){0,1}" +
                        "Mask:(\\d{1,3}\\.){3}\\d{1,3}")) {
//                    System.out.println(line.trim());

                    String[] props = line.trim().split("( ){2}");
                    for (String prop : props) {
                        if (prop.length() == 0) {
                            continue;
                        }

                        String[] kv = prop.split(":");
                        if (kv[0].startsWith("inet addr")) {
                            conf.inetAddr = kv[1];
                        } else if (kv[0].startsWith("Bcast")) {
                            conf.bcast = kv[1];
                        } else if (kv[0].startsWith("Mask")) {
                            conf.mask = kv[1];
                        }
                    }
                }
            } while (true);

        } catch (IOException e) {
            e.printStackTrace();
        }

        return ifconfigs;
    }

    public static InetAddress getInetAddressByInterfaceName(String interfaceName) {
        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            for (NetworkInterface networkInterface : Collections.list(networkInterfaces)) {
                if (networkInterface.getName().equals(interfaceName)) {
                    Enumeration<InetAddress> inetAddresses = networkInterface.getInetAddresses();
                    for (InetAddress inetAddress : Collections.list(inetAddresses)) {
                        if (!inetAddress.isLoopbackAddress()) {
                            return inetAddress;
                        }
                    }
                }
            }
        } catch (SocketException e) {
            e.printStackTrace();
        }
        return null;
    }

    public static String getGatewayAddress() {
        try {
            Enumeration<NetworkInterface> networkInterfaces = NetworkInterface.getNetworkInterfaces();
            while (networkInterfaces.hasMoreElements()) {
                NetworkInterface networkInterface = networkInterfaces.nextElement();
                if (networkInterface.isUp() && !networkInterface.isLoopback() && !networkInterface.isVirtual() && networkInterface.supportsMulticast()) {
                    List<InterfaceAddress> interfaceAddresses = networkInterface.getInterfaceAddresses();
                    for (InterfaceAddress address : interfaceAddresses) {
                        InetAddress gateway = address.getBroadcast();
                        if (gateway != null) {
                            //Log.d(TAG, "gateway: " + gateway.getHostAddress());
                            return gateway.getHostAddress();
                        }
                    }
                }
            }
        } catch (SocketException e) {
            e.printStackTrace();
        }
        //return "";
        return null;
    }

    @RequiresApi(api = Build.VERSION_CODES.M)
    public static String getDefaultDnsServer(Context context) {
        ConnectivityManager connectivityManager = (ConnectivityManager) context.getSystemService(Context.CONNECTIVITY_SERVICE);
        if (connectivityManager != null) {
            Network network = connectivityManager.getActiveNetwork();
            if (network != null) {
                LinkProperties linkProperties = connectivityManager.getLinkProperties(network);
                if (linkProperties != null) {
                    List<InetAddress> dnsServers = linkProperties.getDnsServers();
                    if (!dnsServers.isEmpty()) {
                        return dnsServers.get(0).getHostAddress();
                    }
                }
            }
        }
        return null;
    }
}
