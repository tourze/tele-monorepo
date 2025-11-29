//
//  ProxyService.swift

//
//  Created by LEI on 12/28/15.
//  Copyright © 2015 TouchingApp. All rights reserved.
//

import Foundation
import Async
import Appirater
import ShadowLibrary

@objc class VPN: NSObject {

    @objc static func switchVPN(completion: ((Error?) -> Void)? = nil) {
        if Manager.sharedManager.isChangeProxy {
            Manager.sharedManager.isChangeProxy = false
            Manager.sharedManager.stopVPN()
            Async.main(after: 1) {
                _switchDefaultVPN(completion: completion)
            }
        }else {
            _switchDefaultVPN(completion: completion)
        }
    }

    fileprivate static func _switchDefaultVPN(completion: ((Error?) -> Void)? = nil) {
        Manager.sharedManager.setDefaultConfigGroup()
        Manager.sharedManager.switchVPN { (manager, error) in
            if let _ = manager {
                Async.background(after: 2, { () -> Void in
                    Appirater.userDidSignificantEvent(false)
                })
            }
            Async.main{
                completion?(error)
            }
        }
    }
    
}
