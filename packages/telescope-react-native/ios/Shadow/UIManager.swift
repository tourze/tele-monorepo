//
//  UIManager.swift

//
//  Created by LEI on 12/27/15.
//  Copyright © 2015 TouchingApp. All rights reserved.
//

import Foundation
import ICSMainFramework
import ShadowLibrary

class UIManager: NSObject, AppLifeCycleProtocol {
    
    var keyWindow: UIWindow? {
        return UIApplication.shared.keyWindow
    }
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
//        UIView.appearance().tintColor = Color.NavigationTintColor

        UITableView.appearance().backgroundColor = Color.Background
        UITableView.appearance().separatorColor = Color.Separator

        UITextField.appearance().tintColor = .gray

        
//        UINavigationBar.appearance().isTranslucent = false
//        UINavigationBar.appearance().barTintColor = Color.NavigationBackground
        UINavigationBar.appearance().titleTextAttributes = [NSAttributedString.Key(rawValue: NSAttributedString.Key.foregroundColor.rawValue): Color.NavigationTintColor]
        UINavigationBar.appearance().tintColor = Color.DefualtColor
//
        UINavigationBar.appearance().backIndicatorImage = UIImage(named: "barButtonItem_back")
        UINavigationBar.appearance().backIndicatorTransitionMaskImage = UIImage(named: "barButtonItem_back_mask")
//        UIBarButtonItem.appearance().setBackButtonTitlePositionAdjustment(UIOffset(horizontal: -50, vertical: 0), for: .default)
//
        UITabBar.appearance().isTranslucent = false
        UITabBar.appearance().backgroundColor = Color.TabBackground
        UITabBar.appearance().tintColor = Color.TabItemSelected
        //NSLog("window=\(application.keyWindow)")
        let navVC = MyNavigationController(rootViewController: ShadowMainViewController())
        keyWindow?.rootViewController = navVC//makeRootViewController()
        
//        keyWindow?.rootViewController = makeRootViewController()
        
        return true
    }
    
    


    
}
