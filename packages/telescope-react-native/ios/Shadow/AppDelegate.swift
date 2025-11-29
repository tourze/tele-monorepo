//
//  AppDelegate.swift

//
//  Created by LEI on 12/12/15.
//  Copyright © 2015 TouchingApp. All rights reserved.
//

import UIKit
import ICSMainFramework
import Async
import React

@UIApplicationMain
 private class AppDelegate: ICSMainFramework.AppDelegate {
//    override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any]) -> Bool {
//        let urlString = url.absoluteString
//        if (urlString.contains("safepay")) {
//            DispatchQueue.main.async {
//                NotificationCenter.default.post(name: NSNotification.Name(rawValue: "ALIPAY_CALLBACK"), object: ["code" : "200"], userInfo: nil)
//            }
//        } else if url.absoluteString.lowercased().hasPrefix("telescope://") {
//            
//            if let app = UIApplication.shared.delegate as? AppDelegate, let window = app.window {
//                
//                let uriString = url.absoluteString.removingPercentEncoding ?? ""
//                let cardAndPasswd = String(uriString[uriString.index(uriString.startIndex, offsetBy: "telescope://".count)...])
//                
//                
//
//                var isNeedDelay = true
//                if let navVC = window.rootViewController as? UINavigationController {
//                    
//                    if navVC.viewControllers.count > 0 {
//                        if navVC.viewControllers[0].isKind(of: ShadowMainViewController.self) {
//                            
//                            let homeVC = navVC.viewControllers[0] as! ShadowMainViewController
//                            
//                            isNeedDelay = false
//                            
//                            homeVC.navigationController?.popToRootViewController(animated: true)
//                            if cardAndPasswd == "switch" {
//                                if homeVC.status == .off {
//                                    homeVC.handButtonAction()
//                                }
//                            } else if cardAndPasswd == "choose-node" {
//                                homeVC.chooseButtonAction()
//                            } else {
//                                homeVC.activityByCardPassword(cardAndPasswd: cardAndPasswd)
//                            }
//                        }
//                    }
//                }
//
//                if isNeedDelay {
//                    Async.main(after: 5,  {
//                        NotificationCenter.default.post(name: NSNotification.Name(rawValue: "importActivateCard"), object: nil, userInfo: ["cardAndPasswd": cardAndPasswd])
//                    })
//                }
//            }
//        }
//        return true;
//    }
   
   override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
       // 调用父类的实现
       let result = super.application(application, didFinishLaunchingWithOptions: launchOptions)

       // 配置 React Native
       let jsCodeLocation = self.jsCodeLocation()!

       let rootView = RCTRootView(bundleURL: jsCodeLocation, moduleName: "TelescopeReactNative", initialProperties: nil, launchOptions: launchOptions)

       // 创建一个新的视图控制器并将其设置为根视图控制器
       let rootViewController = UIViewController()
       rootViewController.view = rootView

       // 设置窗口的根视图控制器
       self.window?.rootViewController = rootViewController
       self.window?.makeKeyAndVisible()

       return result
   }
   
   private func jsCodeLocation() -> URL? {
#if DEBUG
       return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "src/main")
#else
       return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
   }
}

