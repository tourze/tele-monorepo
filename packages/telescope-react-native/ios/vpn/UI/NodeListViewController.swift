//
//  NodeListViewController.swift

//
//  Created by  on 2020/11/1.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation
import SnapKit
import UIKit

var indexRow:Int = 0

class NodeListViewController:UIViewController {
    
    var shadowListArray : Array<ProfileServer> = []
//    var normalListArray : Array<ProfileServer> = []
    
    
    let tableView = UITableView()
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return .darkContent
        } else {
            return .default
        }
    }
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        title  = "选择节点"
        
        setRighNavgation()
        setViewConstraint()
        
        NotificationCenter.default.addObserver(self, selector: #selector(fetchData), name: NSNotification.Name(rawValue: "nodeListReload"), object: nil)
        Manager.sharedManager.wormhole.listenForMessage(withIdentifier: "nodelist_tcpping_result") { [unowned self](pingResult)  in
            
            if let pingResultString = pingResult as? String {
                if let pingResultDic = pingResultString.jsonDictionary() as? Dictionary<String, Any> {
                    for (key, value) in pingResultDic {
                        
                        if key == "last" {
                            if self.pingBtn.animating == true {
                                self.pingBtn.animating = false
                            }
                        } else {
                            Manager.sharedManager.pingCheckDic[key] = Int(value as! String)!
                            self.reloadPingResult(hostPort: key)
                        }
                    }
                }
            }
        }
    
        tableView.delegate = self
        tableView.dataSource = self
        tableView.tableFooterView = UIView()
        tableView.separatorStyle = .none
//        tableView.estimatedRowHeight = 60
//        tableView.rowHeight = UITableView.automaticDimension
//        tableView.autoresizesSubviews = false
        tableView.register(MessageCell.self, forCellReuseIdentifier: "MessageCell")
        
        
        fetchData()
        
        

    }
    
    deinit {
        Manager.sharedManager.wormhole.stopListeningForMessage(withIdentifier: "nodelist_tcpping_result")
    }
    
    lazy var pingBtn: FlatButton = {
        let b = FlatButton(frame: CGRect.zero)
        b.setTitleColor(UIColor.white, for: UIControl.State())
        b.setTitle("测速", for: UIControl.State())
        b.titleLabel?.font = UIFont.systemFont(ofSize: 14)
        b.backgroundColor = UIColor.red
        b.layer.cornerRadius = 5
        b.layer.masksToBounds = true
        b.addTarget(self, action: #selector(pingClick), for: .touchUpInside)
        return b
    }()

    lazy var headView: UIView = {
        let v = UIView()
        v.backgroundColor = "ebebeb".color
        v.frame = CGRect(x: 0, y: 0, width: self.view.bounds.width, height: 50)
        return v
    }()
    
    @objc func pingClick() {
        let shadowServers = LocalTools.instance.getShadowNodeFromLocal()

        if shadowServers.count > 0 {
            self.pingBtn.animating = true
            if Manager.sharedManager.vpnStatus == VPNStatus.on {
                pingByWormhole()
            } else {
                startPing({() -> () in
                    self.pingBtn.animating = false
                    LocalTools.instance.mainViewController?.updatePingLabel()

                })
            }
        } else {
            self.showTextHUD("\("Please choose node or add node first".localized())", dismissAfterDelay: 1.5)
        }
    }
    
    func pingOneNode(host: String, port: UInt, _ completed: @escaping () -> ()) {
        if Manager.sharedManager.vpnStatus == VPNStatus.on {
            let pingDic = [host + String(port): port]
            Manager.sharedManager.wormhole.passMessageObject((pingDic as NSDictionary).jsonString() as NSCoding?, identifier: "tcpping")
        } else {
            TcpPingBridge.start(host, port: port, count: 3) { avg in
                var pingResult = -1
                if let avg = avg { pingResult = avg }
                let hp = host + String(port)
                Manager.sharedManager.pingCheckDic[hp] = pingResult
                completed()
            }
        }
    }
    
    func pingByWormhole() {
        let shadowServers = LocalTools.instance.getShadowNodeFromLocal()

        var pingDic: Dictionary<String, Any> = [:]
        for server in shadowServers {
            
            if let node = server {
                let host = node.ip!
                let port = node.port!
                pingDic[host + String(port)] = port
            }
            
        }
        Manager.sharedManager.wormhole.passMessageObject((pingDic as NSDictionary).jsonString() as NSCoding?, identifier: "tcpping")
    }
    
    func startPing(_ completed: @escaping () -> ()) {
        let shadowServers = LocalTools.instance.getShadowNodeFromLocal()

        var count: Int = 0
        for proxy in shadowServers {
            
            if let node = proxy {
                
                let host = node.ip!
                let port = node.port!
                
                TcpPingBridge.start(host, port: port, count: 3) { avg in
                    count += 1
                    var pingResult = -1
                    if let avg = avg { pingResult = avg }
                    let hp = host + String(port)
                    Manager.sharedManager.pingCheckDic[hp] = pingResult
                    self.reloadPingResult(hostPort: hp)
                    if count == shadowServers.count {
                        completed()
                    }
                }
            }
            
        }
        
    }
    
    func reloadPingResult(hostPort: String) {

        for index in 0..<shadowListArray.count {
            
            let node = shadowListArray[index]
            let hp = node.ip! + String(node.port!)
            
            if hp == hostPort {
                tableView.reloadRows(at: [IndexPath(row: index, section: 0)], with: .none)
            }
            
        }
    }
    
    @objc func fetchData()  {

        shadowListArray.removeAll()
//        normalListArray.removeAll()
        let shadowServers = LocalTools.instance.getShadowNodeFromLocal()
//        let normalServers = LocalTools.instance.getNormalNodeFromLocal()
        
//        if(normalServers.count == 0 && !LocalTools.instance.AccountCardActive()){
//
//            let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
//
//            if iosExamine {
//                self.showTextHUD("请先到官网添加节点,或者联系客服", dismissAfterDelay: 2)
//            } else {
//                self.showTextHUD("请先新增节点", dismissAfterDelay: 2)
//            }
//        }
        
        if shadowServers.count > 0 {
            shadowListArray.append(LocalTools.instance.GetAutoServer())
            
            for item in shadowServers {
                if item != nil{
                    shadowListArray.append(item!)
                }
                
            }
            
        }
        
        tableView.reloadData()
        
//        if normalServers.count > 0{
//            for item in normalServers {
//                if item != nil{
//                    normalListArray.append(item!)
//                }
//
//            }
//        }
//        addTableData()
    }
        
    //MARK: UI
    func setViewConstraint() {
      
        tableView.separatorStyle = .none
        tableView.backgroundColor = "ebebeb".color
        view.addSubview(tableView)
        
  
        tableView.snp.makeConstraints { (make) in
            make.left.right.top.bottom.equalTo(view)
        }
        
//        tableView.tableHeaderView = headView
//        headView.addSubview(pingBtn)
//
//        pingBtn.snp.makeConstraints { make in
//            make.right.equalToSuperview().offset(-18)
//            make.top.equalToSuperview().offset(10)
//            make.size.equalTo(CGSize(width: 48, height: 24))
//        }
//
//        headView.setNeedsLayout()
//        headView.layoutIfNeeded()
    }
    
    
    func setRighNavgation() {
        navigationItem.rightBarButtonItem = UIBarButtonItem(title: "刷新", style: .plain, target: self, action: #selector(rightButtonAction))

//        let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
//
//        if iosExamine {
//        } else {
//            navigationItem.rightBarButtonItem = UIBarButtonItem(title: "新增", style: .plain, target: self, action: #selector(rightButtonAction))
//        }
    }
    
    
    func updateNodes(){
        if(AppData.authUser != nil){
            self.showProgreeHUD()
            LocalTools.instance.mainViewController?.updatingNodes = true
            ShadowApiService.instance.GetServers(onSuccess: {
                result in
                LocalTools.instance.mainViewController?.updatingNodes = false
                if(result.code == HttpResult.HTTP_OK && result.data != nil){
                    LocalTools.instance.mainViewController?.updateServersFrom(profileServers: result.data!)
                    self.showTextHUD("节点刷新成功", dismissAfterDelay: 1.5)
                    self.fetchData()
                }else{
                    self.showTextHUD(result.message ?? "节点刷新失败", dismissAfterDelay: 1.5)
                }
                
            },onFail:{
                error in
                LocalTools.instance.mainViewController?.updatingNodes = false
                self.showTextHUD("节点刷新失败", dismissAfterDelay: 1.5)
            },token:AppData.authUser?.token )
        }
    }
    
    @objc func rightButtonAction() {
        
        //刷新
        updateNodes()
//        let iosExamine = Shadow.sharedUserDefaults().bool(forKey: "iosExamine")
//
//        if iosExamine {
//
//        } else {
//            let vc = NodeConfigVC()
//            navigationController?.pushViewController(vc, animated: true)
//        }
        
    }
    

}
extension NodeListViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {

        return shadowListArray.count //接口数据数量
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if shadowListArray.count == 0 {
            return UITableViewCell()
        }
        
        let node = shadowListArray[indexPath.row]
        
        var reuseIdentifier = "NodeCell"
        if indexPath.row == 0 {
            reuseIdentifier = "AutoCell"
        }
        
        let cell = NodeCell(style: .default, reuseIdentifier: reuseIdentifier) as NodeCell
        cell.selectionStyle = .none
        
        var activiteId:Int64 = -1
        if let activiteProfile = LocalTools.instance.getActiviteProfile() {
            activiteId = activiteProfile.id ?? -1
        }
        cell.config(node: node, selectId: activiteId)
        
        if indexPath.row == 0 {
            cell.contentView.addSubview(pingBtn)
            
            pingBtn.snp.makeConstraints { make in
                make.right.equalTo(cell.pingLabel.snp.right)
                make.centerY.equalToSuperview()
                make.size.equalTo(CGSize(width: 48, height: 24))
            }
        }
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        
        return 50
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        let index = indexPath.row
        
        let node = shadowListArray[index]
        
        LocalTools.instance.selectedProfileServer(model:node)
        Shadow.sharedUserDefaults().set(node.name, forKey: kSelectNode)

        LocalTools.instance.mainViewController?.changeProxy()
        self.navigationController?.popToRootViewController(animated: true)
    }

    //尾部滑动事件按钮（左滑按钮）
    @available(iOS 11.0, *)
    public func tableView(_ tableView: UITableView, trailingSwipeActionsConfigurationForRowAt
                          indexPath: IndexPath) -> UISwipeActionsConfiguration? {

        let row = indexPath.row
        if row > indexRow {

            //创建“编辑”事件按钮
            let edit = UIContextualAction(style: .normal, title: "测速") {
                (action, view, completionHandler) in

                
                let node = self.shadowListArray[indexPath.row]
                self.pingOneNode(host: node.ip!, port: UInt(node.port!), {() -> () in
                    tableView.reloadRows(at: [indexPath], with: .none)
                    LocalTools.instance.mainViewController?.updatePingLabel()
                })
                
                completionHandler(true)

            }
            //返回所有的事件按钮
            let configuration = UISwipeActionsConfiguration(actions: [edit])
            return configuration

        }else{
            return nil
        }
    }

    //返回每一个行对应的事件按钮
    public func tableView(_ tableView: UITableView, editActionsForRowAt indexPath: IndexPath)
    -> [UITableViewRowAction]? {
        let row = indexPath.row
        if row > indexRow{
            
            let edit = UITableViewRowAction(style: .normal, title: "测速") {
                action, index in
                //对应条目的数据编辑

                debugPrint("ping 2")

            }
            edit.backgroundColor = UIColor.red
            //返回所有的事件按钮
            return [edit]
        }else{
            return nil
        }
    }
}

