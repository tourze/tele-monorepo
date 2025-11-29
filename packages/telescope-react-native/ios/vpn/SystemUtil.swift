//
//  SystemUtil.swift

//
//  Created by sysdlo on 2019/9/21.
//  Copyright © 2019 qiuyuzhou. All rights reserved.
//

import Foundation
import FCUUID

class SystemUtil: NSObject {
    static let appBuild = Bundle.main.infoDictionary?["CFBundleVersion"] as! String

    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as! String
   // static let versionCode = Bundle.main.infoDictionary?["VesionCode"] as! Int
    static let platform = "ios"
    static var systemVersion = UIDevice.current.systemVersion
    static let imei = getImei()
    static let WEBSITE_ID = "c35ca3c8-cab7-4b1c-8960-d2ff200974c6"
    
    static let phoneModel = GetPhoneModel()
    
//    static let channel = Shadow.sharedUserDefaults().string(forKey: "channel")
//    static let versionCode:Int = 1

    static func getImei() -> String {
        let uuid = FCUUID.uuidForDevice() ?? "1111-1111-1111-111"
        //下面代码测试使用
//        var uuid = FCUUID.uuidForDevice() ?? "1111-1111-1111-111"
//        if uuid == "43486490892241fbb311b6bb68657a06" {
//            uuid = "1111-5111-1111-111"
//        }
        return uuid
    }
    
    static func GetPhoneModel() -> String {
    var systemInfo = utsname()
       uname(&systemInfo)
       var sysversion = platform
       let _ = withUnsafePointer(to: &systemInfo.machine.0) { ptr in
            sysversion = String(cString: ptr)
       }
        return sysversion
    }
    
    static func isiPhoneX() ->Bool {
        guard #available(iOS 11.0, *) else {
            return false
        }
        
        return UIApplication.shared.windows[0].safeAreaInsets != UIEdgeInsets.zero
    }
    
    /// 是否是 testflight包
    public static var isTestFlight: Bool {
        return isAppStoreReceiptSandbox && !hasEmbeddedMobileProvision
     }
    /// 是否是 Appstore 包
     public static var isAppStore: Bool {
         if isAppStoreReceiptSandbox || hasEmbeddedMobileProvision {
          return false
         }
         return true
     }
     fileprivate static var isAppStoreReceiptSandbox: Bool {
         let b = Bundle.main.appStoreReceiptURL?.lastPathComponent == "sandboxReceipt"
         NSLog("isAppStoreReceiptSandbox: \(b)")
        return b
     }
     fileprivate static var hasEmbeddedMobileProvision: Bool {
        let b = Bundle.main.path(forResource: "embedded", ofType: "mobileprovision") != nil
        NSLog("hasEmbeddedMobileProvision: \(b)")
        return b
     }
}


