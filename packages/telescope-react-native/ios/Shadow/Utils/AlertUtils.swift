//
//  AlertUtils.swift

//
//  Created by LEI on 4/10/16.
//  Copyright © 2016 TouchingApp. All rights reserved.
//

import Foundation

class Alert: NSObject {

    static func show(_ vc: UIViewController, title: String? = nil, message: String? = nil, confirmMessage: String = "OK".localized(), confirmCallback: (() -> Void)?, cancelMessage: String = "Cancel".localized(), cancelCallback: (() -> Void)?) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        let confirmAction = UIAlertAction(title: confirmMessage, style: .default, handler: { (action) in
            confirmCallback?()
        })
        confirmAction.setValue(UIColor.black, forKey: "titleTextColor")
        
        alert.addAction(confirmAction)
        let cancelAction = UIAlertAction(title: cancelMessage, style: .cancel, handler: { (action) in
            cancelCallback?()
        })
        cancelAction.setValue(UIColor.gray, forKey: "titleTextColor")

        alert.addAction(cancelAction)
        vc.present(alert, animated: true, completion: nil)
    }
    
    static func show(_ vc: UIViewController, title: String? = nil, message: String? = nil, confirmCallback: (() -> Void)? = nil) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK".localized(), style: .default, handler: { (action) in
            confirmCallback?()
        }))
        vc.present(alert, animated: true, completion: nil)
    }
    
}
