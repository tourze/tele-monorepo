package com.github.shadowsocks.utils;
// 文件已迁移至库模块（react-native-shadowsocksr）

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.telephony.TelephonyManager;

import com.shadow.ssrclient.util.AppUtils;

/**
 * 系统工具类
 * Created by zhuwentao on 2016-07-18.
 */
public class SystemUtil {

    private static final String IMEI_KEY = "imei_key";
    private static final String PRE_NAME = "phone_state";

    /**
     * 获取当前手机系统版本号
     *
     * @return 系统版本号
     */
    public static String getSystemVersion() {
        return Build.VERSION.RELEASE;
    }

    /**
     * 获取手机IMEI(需要“android.permission.READ_PHONE_STATE”权限)
     *
     * @return 手机IMEI 直接使用生成
     */
    @SuppressLint("MissingPermission")
    public static String getIMEI(Context ctx) {
        String imei = SharedPrefsUtil.getValue(ctx, PRE_NAME, IMEI_KEY, null);
        if (imei != null && !imei.isEmpty()) {
            LogUtil.INSTANCE.d(SystemUtil.class.getName(), "get imei from pref:" + imei);
            return imei;
        }
//        String imei = null;
        try {
            TelephonyManager tm = (TelephonyManager) ctx.getSystemService(Activity.TELEPHONY_SERVICE);
            if (tm != null) {
                if (Build.VERSION.SDK_INT > Build.VERSION_CODES.N_MR1) {
                    imei = tm.getImei(TelephonyManager.PHONE_TYPE_NONE);
//                    LogUtil.INSTANCE.i(SystemUtil.class.getName(), "getImei:"+ tm.getImei(TelephonyManager.PHONE_TYPE_NONE)+","
//                            +tm.getImei(TelephonyManager.PHONE_TYPE_GSM)+","
//                            +tm.getImei(TelephonyManager.PHONE_TYPE_CDMA)+","
//                            +tm.getImei(TelephonyManager.PHONE_TYPE_SIP)+","+tm.getImei());
                } else if (Build.VERSION.SDK_INT > Build.VERSION_CODES.LOLLIPOP_MR1) {
                    imei = tm.getDeviceId(TelephonyManager.PHONE_TYPE_NONE);
//                    LogUtil.INSTANCE.i(SystemUtil.class.getName(), "getDeviceId(index):"+ tm.getDeviceId(TelephonyManager.PHONE_TYPE_NONE)+","
//                            +tm.getDeviceId(TelephonyManager.PHONE_TYPE_GSM)+","
//                            +tm.getDeviceId(TelephonyManager.PHONE_TYPE_CDMA)+","
//                            +tm.getDeviceId(TelephonyManager.PHONE_TYPE_SIP)+",");
                } else {
                    imei = tm.getDeviceId();
//                    LogUtil.INSTANCE.d(SystemUtil.class.getName(),"getDeviceId:"+ tm.getDeviceId());
                }
//                LogUtil.INSTANCE.d(SystemUtil.class.getName(),"print getDeviceId:"+ tm.getDeviceId());
            }
        } catch (Exception e) {
            imei = null;
        }

        if (imei == null || imei.isEmpty()) {
            imei = AppUtils.INSTANCE.getUniqueID(ctx);
        }
        if (imei != null) {
            SharedPrefsUtil.putValue(ctx, PRE_NAME, IMEI_KEY, imei);
        } else {
            imei = "";
        }
        LogUtil.INSTANCE.d(SystemUtil.class.getName(), "get imei:" + imei);
        return imei;

    }

    /**
     * [获取应用程序版本名称信息]
     *
     * @param context
     * @return 当前应用的版本名称
     */
    public static synchronized int getVersionCode(Context context) {
        try {
            PackageManager packageManager = context.getPackageManager();
            PackageInfo packageInfo = packageManager.getPackageInfo(
                    context.getPackageName(), 0);
            return packageInfo.versionCode;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 0;
    }

    /**
     * [获取应用程序版本名称信息]
     *
     * @param context
     * @return 当前应用的版本名称
     */
    public static synchronized String getVersionName(Context context) {
        try {
            PackageManager packageManager = context.getPackageManager();
            PackageInfo packageInfo = packageManager.getPackageInfo(
                    context.getPackageName(), 0);
            return packageInfo.versionName;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "1.0.1";
    }
}
