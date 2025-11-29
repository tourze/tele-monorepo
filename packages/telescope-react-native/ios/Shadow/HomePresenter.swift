//
//  HomePresenter.swift

//
//  Created by LEI on 6/22/16.
//  Copyright © 2016 TouchingApp. All rights reserved.
//

import Foundation

protocol HomePresenterProtocol: AnyObject {
    func handleRefreshUI()
    func changeProxy()
}

class HomePresenter: NSObject {

    var vc: UIViewController!
    let wormhole = Manager.sharedManager.wormhole


    weak var delegate: HomePresenterProtocol?

    override init() {
        super.init()
        NotificationCenter.default.addObserver(self, selector: #selector(onVPNStatusChanged), name: NSNotification.Name(rawValue: kProxyServiceVPNStatusNotification), object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(chooseProxy), name: NSNotification.Name(rawValue: "chooseProxy"), object: nil)

    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    func bindToVC(_ vc: UIViewController) {
        self.vc = vc
    }

    // MARK: - Actions

    func switchVPN() {
        VPN.switchVPN() { [unowned self] (error) in
            if let error = error {
                Alert.show(self.vc, message: "\("Fail to switch VPN.".localized()) (\(error))")
            }
        }
    }

    @objc func chooseProxy() {
//        let chooseVC = ProxyListVC(allowNone: true) { [unowned self] proxy in
//            do {
//                try ConfigurationGroup.changeProxy(forGroupId: self.group.uuid, proxyId: proxy?.uuid)
//                self.delegate?.handleRefreshUI()
////                Manager.sharedManager.setDefaultConfigGroup(self.group.uuid, name: self.group.name)
////                self.wormhole.passMessageObject("" as NSCoding?, identifier: "resetProxy")
//
//                self.delegate?.changeProxy()
//            }catch {
//                self.vc.showTextHUD("\("Fail to change proxy".localized()): \((error as NSError).localizedDescription)", dismissAfterDelay: 1.5)
//            }
//        }
//        vc.navigationController?.pushViewController(chooseVC, animated: true)
    }
    
    func add() {
//        let proxyConfigurationVC = ProxyConfigurationVC()
//        vc.navigationController?.pushViewController(proxyConfigurationVC, animated: true)
    }
    
    @objc func qRCode() {
        let importer = Importer(vc: self.vc)
        importer.importConfigFromQRCode()
//        ConfigGroupChooseManager.shared.show()
    }

//    func showAddConfigGroup() {
//        var urlTextField: UITextField?
//        let alert = UIAlertController(title: "Add Config Group".localized(), message: nil, preferredStyle: .alert)
//        alert.addTextField { (textField) in
//            textField.placeholder = "Name".localized()
//            urlTextField = textField
//        }
//        alert.addAction(UIAlertAction(title: "OK".localized(), style: .default, handler: { (action) in
//            if let input = urlTextField?.text {
//                do {
//                    try self.addEmptyConfigGroup(input)
//                }catch{
//                    Alert.show(self.vc, message: "\("Failed to add config group".localized()): \(error)")
//                }
//            }
//        }))
//        alert.addAction(UIAlertAction(title: "Cancel".localized(), style: .cancel, handler: nil))
//        vc.present(alert, animated: true, completion: nil)
//    }

//    func addEmptyConfigGroup(_ name: String) throws {
//        let trimmedName = name.trimmingCharacters(in: CharacterSet.whitespaces)
//        if trimmedName.count == 0 {
//            throw "Name can't be empty".localized()
//        }
//        let group = ConfigurationGroup()
//        group.name = trimmedName
//        try DBUtils.add(group)
//        CurrentGroupManager.shared.setConfigGroupId(group.uuid)
//    }

    func addRuleGroup() {
//        let destVC: UIViewController
//        if defaultRealm.objects(RuleGroup.self).count == 0 {
//            destVC = RuleGroupConfigurationVC() { [unowned self] ruleGroup in
//                self.appendRuleGroup(ruleGroup)
//            }
//        }else {
//            destVC = RuleGroupListVC { [unowned self] ruleGroup in
//                self.appendRuleGroup(ruleGroup)
//            }
//        }
//        vc.navigationController?.pushViewController(destVC, animated: true)
    }


    @objc func onVPNStatusChanged() {
        self.delegate?.handleRefreshUI()
    }


}
