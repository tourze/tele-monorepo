//
//  DBInitializer.swift

//
//  Created by LEI on 3/8/16.
//  Copyright © 2016 TouchingApp. All rights reserved.
//

import UIKit
import ICSMainFramework
import NetworkExtension
import CloudKit
import Async
import ShadowLibrary
import SwiftyStoreKit

class DataInitializer: NSObject, AppLifeCycleProtocol {

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        Manager.sharedManager.setup()
        sync()
        
//        Async.background {
//            ios_start(strdup(Shadow.sharedGostFileUrl().path.cString(using: String.Encoding.utf8)), strdup("".cString(using: String.Encoding.utf8)))
////            test_tcp()
//        }
        
        // see notes below for the meaning of Atomic / Non-Atomic
            SwiftyStoreKit.completeTransactions(atomically: true) { purchases in
                for purchase in purchases {
                    switch purchase.transaction.transactionState {
                    case .purchased, .restored:
                        if purchase.needsFinishTransaction {
                            // Deliver content from server, then:
                            SwiftyStoreKit.finishTransaction(purchase.transaction)
                        }
                        // Unlock content
                    case .failed, .purchasing, .deferred:
                        break // do nothing
                    default:
                        break
                    }
                }
            }

        return true
    }
    
    func applicationDidEnterBackground(_ application: UIApplication) {
        _ = try? Manager.sharedManager.regenerateConfigFiles()
    }

    func applicationWillTerminate(_ application: UIApplication) {
        _ = try? Manager.sharedManager.regenerateConfigFiles()
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        sync()
    }

//    func sync() {
//        SyncManager.shared.sync()
//    }

}
