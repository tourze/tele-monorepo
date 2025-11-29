package com.shadow.ssrclient.util;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.os.Debug;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.Locale;

public class DebuggerUtils {

    /**
     * 判断当前应用是否是debug状态
     */
    public static boolean isDebuggable(Context context) {
        try {
            ApplicationInfo info = context.getApplicationInfo();
            return (info.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 检测是否在非Debug编译模式下，进行了调试操作，以防动态调试
     *
     * @param context
     */
    public static void checkDebuggableInNotDebugModel(Context context) {
        if (isDebuggable(context)) {
            System.exit(0);
        }

        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                while (true) {
                    try {
                        //每隔300ms检测一次
                        Thread.sleep(300);
                        //判断是否有调试器连接，是就退出
                        if (Debug.isDebuggerConnected()) {
                            System.exit(0);
                        }

                        //判断是否被其他进程跟踪，是就退出
                        if (isUnderTraced()) {
                            System.exit(0);
                        }
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        }, "SafeGuardThread");
        t.start();

        if (isUnderTraced()) {
            System.exit(0);
        }
    }

    /**
     * 当我们使用Ptrace方式跟踪一个进程时，目标进程会记录自己被谁跟踪，可以查看/proc/pid/status看到这个信息,而没有被调试的时候TracerPid为0
     *
     * @return
     */
    private static boolean isUnderTraced() {
        String processStatusFilePath = String.format(Locale.US, "/proc/%d/status", android.os.Process.myPid());
        File procInfoFile = new File(processStatusFilePath);
        try {
            BufferedReader b = new BufferedReader(new FileReader(procInfoFile));
            String readLine;
            while ((readLine = b.readLine()) != null) {
                if (readLine.contains("TracerPid")) {
                    String[] arrays = readLine.split(":");
                    if (arrays.length == 2) {
                        int tracerPid = Integer.parseInt(arrays[1].trim());
                        if (tracerPid != 0) {
                            return true;
                        }
                    }
                }
            }

            b.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }
}