//
//  UrlHandler.swift

//
//  Created by LEI on 4/13/16.
//  Copyright © 2016 TouchingApp. All rights reserved.
//

import Foundation
import ICSMainFramework
import ShadowLibrary
import Async
import CallbackURLKit
typealias callbackURLKit_Manager = CallbackURLKit.Manager

class UrlHandler: NSObject, AppLifeCycleProtocol {
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        let manager = callbackURLKit_Manager.shared
        manager.callbackURLScheme = callbackURLKit_Manager.urlSchemes?.first
        for action in [URLAction.ON, URLAction.OFF, URLAction.SWITCH] {
            manager[action.rawValue] = { parameters, success, failure, cancel in
                action.perform(nil, parameters: parameters) { error in
                    Async.main(after: 1, {
                        if let error = error {
                            _ = failure(error as NSError)
                        }else {
                            _ = success(nil)
                        }
                    })
                    return
                }
            }
        }
        return true
    }
    
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any]) -> Bool {
        
        
        let components = URLComponents(url: url, resolvingAgainstBaseURL: false)
        var parameters: Parameters = [:]
        components?.queryItems?.forEach {
            guard let _ = $0.value else {
                return
            }
            parameters[$0.name] = $0.value
        }
        if let host = url.host {
            return dispatchAction(url, actionString: host, parameters: parameters)
        }
        return false
    }
    
    func dispatchAction(_ url: URL?, actionString: String, parameters: Parameters) -> Bool {
        guard let action = URLAction(rawValue: actionString) else {
            return false
        }
        return action.perform(url, parameters: parameters)
    }

}

enum URLAction: String {

    case ON = "on"
    case OFF = "off"
    case SWITCH = "switch"
    case XCALLBACK = "x-callback-url"
    case CHOOSENODE = "choose-node"

    func perform(_ url: URL?, parameters: Parameters, completion: ((Error?) -> Void)? = nil) -> Bool {
        switch self {
        case .ON:
            Manager.sharedManager.startVPN({ (manager, error) in
                if error == nil {
                    self.autoClose(parameters)
                }
                completion?(error)
            })
        case .OFF:
            Manager.sharedManager.stopVPN()
            autoClose(parameters)
            completion?(nil)
        case .SWITCH:
            Manager.sharedManager.switchVPN({ (manager, error) in
                if error == nil {
                    self.autoClose(parameters)
                }
                completion?(error)
            })
        case .XCALLBACK:
            if let url = url {
                return callbackURLKit_Manager.shared.handleOpen(url: url)
            }
        case .CHOOSENODE:
            return true
//            if let app = UIApplication.shared.delegate as? AppDelegate, let window = app.window {
//                var isNeedDelay = true
//                if let tabVC = window.rootViewController {
//                    if tabVC.children.count > 0 {
//                        if let navVC = tabVC.children[0] as? UINavigationController {
//                            if navVC.viewControllers.count > 0 {
//                                if let homeVC = navVC.viewControllers[0] as? HomeVC {
//                                    isNeedDelay = false
//                                    homeVC.presenter.chooseProxy()
//                                }
//                            }
//                        }
//                    }
//                }
//
//                if isNeedDelay {
//                    Async.main(after: 5,  {
//                        NotificationCenter.default.post(name: NSNotification.Name(rawValue: "chooseProxy"), object: nil)
//                    })
//                }
//            }
            
        }
        
        return true
    }

    func autoClose(_ parameters: Parameters) {
        var autoclose = false
        if let value = parameters["autoclose"], value.lowercased() == "true" || value.lowercased() == "1" {
            autoclose = true
        }
        if autoclose {
            Async.main(after: 1, {
                UIControl().sendAction(#selector(URLSessionTask.suspend), to: UIApplication.shared, for: nil)
            })
        }
    }

}
