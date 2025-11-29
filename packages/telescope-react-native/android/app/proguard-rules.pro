# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Disabling obfuscation is useful if you collect stack traces from production crashes
# (unless you are using a system that supports de-obfuscate the stack traces).
#-dontobfuscate

# React Native

# Keep our interfaces so they can be used by other ProGuard rules.
# See http://sourceforge.net/p/proguard/bugs/466/
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters

# Do not strip any method/class that is annotated with @DoNotStrip
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}

-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}

-keep class * extends com.facebook.react.bridge.JavaScriptModule { *; }
-keep class * extends com.facebook.react.bridge.NativeModule { *; }
-keepclassmembers,includedescriptorclasses class * { native <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.UIProp <fields>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class *  { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

-dontwarn com.facebook.react.**

# okhttp

-keepattributes Signature
-keepattributes *Annotation*
-keep class com.squareup.okhttp.** { *; }
-keep interface com.squareup.okhttp.** { *; }
-dontwarn com.squareup.okhttp.**

# okio

-keep class sun.misc.Unsafe { *; }
-dontwarn java.nio.file.*
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement
-dontwarn okio.**

# stetho

-dontwarn com.facebook.stetho.**

-dontwarn com.facebook.imagepipeline.animated.factory.AnimatedFactoryImpl

-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }

# copy from https://bin.zmide.com/?p=406

#指定class模糊字典
-classobfuscationdictionary ./pro-android-telescope.txt
#指定package模糊字典
-packageobfuscationdictionary ./pro-android-telescope.txt
#指定外部模糊字典
-obfuscationdictionary ./pro-android-telescope.txt

#------基本指令区------
# 代码混淆压缩比，在0~7之间，默认为5，一般不做修改
-optimizationpasses 5
# 混合时不使用大小写混合，混合后的类名为小写
-dontusemixedcaseclassnames
# 指定不去忽略非公共库的类,是否混淆第三方jar
-dontskipnonpubliclibraryclasses
# 指定不去忽略非公共库的类成员
-dontskipnonpubliclibraryclassmembers
# 不做预校验，preverify是proguard的四个步骤之一，Android不需要preverify，去掉这一步能够加快混淆速度
-dontpreverify
# 混淆时是否记录日志,包含有类名->混淆后类名的映射关系
-verbose
#混淆映射文件输出
-printmapping proguardMapping.txt
#保留Annotation不混淆
-keepattributes *Annotation*,InnerClasses
# 避免混淆泛型
-keepattributes Signature
# 抛出异常时保留源文件名及行号
-keepattributes SourceFile,LineNumberTable
# 指定混淆是采用的算法，后面的参数是一个过滤器，这个过滤器是谷歌推荐的算法，一般不做更改
-optimizations !code/simplification/cast,!field/*,!class/merging/*

-dontwarn org.slf4j.impl.StaticLoggerBinder

-keep class com.learnium.RNDeviceInfo.** { *; }
-keep class com.NewRelic.** { *; }
-keep class com.newrelic.** { *; }
-dontwarn java.lang.invoke.StringConcatFactory

-dontwarn retrofit.Endpoint
-dontwarn retrofit.ErrorHandler
-dontwarn retrofit.Profiler
-dontwarn retrofit.RequestInterceptor
-dontwarn retrofit.RestAdapter$Builder
-dontwarn retrofit.RestAdapter$Log
-dontwarn retrofit.RestAdapter$LogLevel
-dontwarn retrofit.RestAdapter
-dontwarn retrofit.client.Client$Provider
-dontwarn retrofit.client.Client
-dontwarn retrofit.client.Header
-dontwarn retrofit.client.Request
-dontwarn retrofit.client.Response
-dontwarn retrofit.converter.Converter
-dontwarn retrofit.mime.TypedInput
-dontwarn retrofit.mime.TypedOutput
