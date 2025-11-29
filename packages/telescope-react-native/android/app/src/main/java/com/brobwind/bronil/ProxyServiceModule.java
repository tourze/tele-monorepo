package com.brobwind.bronil;

import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Build;
import android.os.IBinder;
import android.os.RemoteException;
import android.util.Log;

import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import com.github.shadowsocks.utils.LogUtil;
import com.shadow.ssrclient.udp.UDPMultiListener;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ProxyServiceModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ProxyServiceModule";
    private final ReactApplicationContext reactContext;
    private boolean mBound = false;
    private IProxyCallback callbackService;

    public ProxyServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ProxyService";
    }

    @ReactMethod
    public void startProxyService() {
        Intent intent = new Intent(reactContext, ProxyService.class);
        reactContext.startService(intent);
        bindService();
    }

    @ReactMethod
    public void stopProxyService() {
        Intent intent = new Intent(reactContext, ProxyService.class);
        reactContext.stopService(intent);
        if (mBound) {
            reactContext.unbindService(mProxyConnection);
            mBound = false;
        }
    }

    @ReactMethod
    public void isProxyServiceRunning(Promise promise) {
        if (mBound == false) {
            promise.resolve(false);
            return;
        }

        if (callbackService != null) {
            try {
                callbackService.getProxyPort(new IProxyPortListener.Stub() {
                    @Override
                    public void setProxyPort(int port) throws RemoteException {
                        promise.resolve(port != -1);
                    }
                });
            } catch (RemoteException e) {
                e.printStackTrace();
                promise.reject("ERROR", "RemoteException occurred", e);
            }
        } else {
            promise.resolve(false);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    @ReactMethod
    public void startUdpListeners(ReadableArray ipAddresses, ReadableArray ports) {
        List<String> ipList = new ArrayList<>();
        List<Integer> portList = new ArrayList<>();

        for (int i = 0; i < ipAddresses.size(); i++) {
            if (ipAddresses.getType(i) == ReadableType.String) {
                ipList.add(ipAddresses.getString(i));
            }
        }

        for (int i = 0; i < ports.size(); i++) {
            if (ports.getType(i) == ReadableType.Number) {
                portList.add(ports.getInt(i));
            }
        }

        String[] ipArray = ipList.toArray(new String[0]);

        LogUtil.INSTANCE.d(TAG, "startUdpListeners ipArray:" + Arrays.toString(ipArray));
        LogUtil.INSTANCE.d(TAG, "startUdpListeners portArray:" + portList);
        UDPMultiListener.startListeners(ipArray, portList);
    }

    @ReactMethod
    public void stopUdpListeners() {
        UDPMultiListener.stopListeners();
    }

    private void bindService() {
        Intent intent = new Intent(reactContext, ProxyService.class);
        reactContext.bindService(intent, mProxyConnection, Context.BIND_AUTO_CREATE);
    }

    private ServiceConnection mProxyConnection = new ServiceConnection() {
        @Override
        public void onServiceDisconnected(ComponentName component) {
            mBound = false;
            callbackService = null;
            Log.d(TAG, "ProxyService disconnected");
        }

        @Override
        public void onServiceConnected(ComponentName component, IBinder binder) {
            callbackService = IProxyCallback.Stub.asInterface(binder);
            mBound = true;
            Log.d(TAG, "ProxyService connected");
        }
    };
}
