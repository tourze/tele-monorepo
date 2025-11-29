//
//  Importer.swift

//
//  Created by LEI on 4/15/16.
//  Copyright © 2016 TouchingApp. All rights reserved.
//

import Foundation
import Async
import ShadowLibrary

struct Importer {
    
    weak var viewController: UIViewController?
    
    init(vc: UIViewController) {
        self.viewController = vc
    }
    
    func importConfigFromUrl() {
        var urlTextField: UITextField?
        let alert = UIAlertController(title: "Import Config From URL".localized(), message: nil, preferredStyle: .alert)
        alert.addTextField { (textField) in
            textField.placeholder = "Input URL".localized()
            urlTextField = textField
        }
        alert.addAction(UIAlertAction(title: "OK".localized(), style: .default, handler: { (action) in
            if let input = urlTextField?.text {
                self.onImportInput(input)
            }
        }))
        alert.addAction(UIAlertAction(title: "CANCEL".localized(), style: .cancel, handler: nil))
        viewController?.present(alert, animated: true, completion: nil)
    }
    
    func importConfigFromQRCode() {
//        let vc = QRCodeScannerVC()
//        vc?.resultBlock = { [weak vc] result in
//            vc?.navigationController?.popViewController(animated: true)
//            self.onImportInput(result!)
//        }
//        vc?.errorBlock = { [weak vc] error in
//            vc?.navigationController?.popViewController(animated: true)
//            self.viewController?.showTextHUD("App needs your consent to access albums".localized(), dismissAfterDelay: 1.5)
//        }
//        vc?.hidesBottomBarWhenPushed = true
//        viewController?.navigationController?.pushViewController(vc!, animated: true)
    }
    
    func onImportInput(_ result: String) {
//        if Proxy.uriIsShadowsocks(result) {
//            importSS(result)
//        }else if Subscribe.uriIsSubscribe(result){
//            importSub(result)
//        }else {
//        }
        
//        importConfig(result, isURL: true)

    }
    
    func onConfigSaveCallback(_ success: Bool, error: Error?) {
        Async.main(after: 0.5) {
            self.viewController?.hideHUD()
            if !success {
                var errorDesc = ""
                if let error = error {
                    errorDesc = "(\(error))"
                }
                if let vc = self.viewController {
                    Alert.show(vc, message: "\("Fail to save config.".localized())")
                    print(errorDesc)
                }
            }else {
                self.viewController?.showTextHUD("Import Success".localized(), dismissAfterDelay: 1.5)
            }
        }
    }

}
