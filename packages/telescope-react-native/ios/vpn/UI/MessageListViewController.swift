//
//  MessageListViewController.swift

//
//  Created by  on 2020/10/31.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation
import SnapKit
import SafariServices

class MessageListViewController: UIViewController {
    
    let tableView = UITableView()
    
    var dataArray = Array<AdModel>() //数据数组
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return .darkContent
        } else {
            return .default
        }
    }
    
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = "消息"
        
        navigationItem.rightBarButtonItem = UIBarButtonItem(title: "全部已读", style: .plain, target: self, action: #selector(rightButtonAction))
        
        setViewConstraint()
        
        fetchData()
        
    }
    
    @objc func rightButtonAction() {
        print("全部已读")
        let adJson = LocalTools.instance.getAdsFromLocal()
        
        var items:[AdModel] = []
        adJson.forEach({
            ad in
            if(ad?.msgType=="msg"){
                ad?.read = true
            }
            items.append(ad!)
        })
        
        LocalTools.instance.setValueForKey(key: "ads", value: items.toJSONString())
        LocalTools.instance.setValueForKey(key: "hasNoRead", value: true)
        
        fetchData()
    }
    
    
    func fetchData() {
        dataArray.removeAll()
        let adJson = LocalTools.instance.getAdsFromLocal()
        adJson.forEach({
            item in
            if(item?.msgType == "msg"){
                dataArray.append(item!)
            }
        })
        tableView.reloadData()
    }
    
    func setViewConstraint() {
        view.backgroundColor = .white
        
//        tableView.mj_header = MJRefreshNormalHeader(refreshingTarget: self, refreshingAction: #selector(refreshData))
//        tableView.mj_footer = MJRefreshAutoNormalFooter(refreshingTarget: self, refreshingAction: #selector(loadmoreData))
       
        tableView.delegate = self
        tableView.dataSource = self
        tableView.tableFooterView = UIView()
        tableView.separatorStyle = .none
        tableView.backgroundColor = .white
        tableView.estimatedRowHeight = 84
        tableView.rowHeight = UITableView.automaticDimension
        tableView.autoresizesSubviews = false
        tableView.register(MessageCell.self, forCellReuseIdentifier: "MessageCell")
        view.addSubview(tableView)
        
        tableView.snp.makeConstraints { (make) in
            make.left.right.top.bottom.equalTo(view)
        }
    }
}


extension MessageListViewController: UITableViewDelegate, UITableViewDataSource, SFSafariViewControllerDelegate {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {

        return dataArray.count //接口数据数量
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if dataArray.count == 0 {
            return UITableViewCell()
        }
        
        let model = dataArray[indexPath.row]
        let cell = MessageCell(style: .default, reuseIdentifier: "MessageCell") as MessageCell
        cell.selectionStyle = .none
        // RecordModel
         cell.model = model
        return cell
    }
    
//    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
//        if dataArray.count > 0 {
////            return UITableView.automaticDimension
//            return 84
//        }
//        return 300
//    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        let index = indexPath.row
        
        let admodel = dataArray[index]
        
        let adJson = LocalTools.instance.getAdsFromLocal()
        var needupdate = false
        var hasNoRead = false
        var items:[AdModel] = []
        adJson.forEach({
            ad in
            
            if ad?.title == admodel.title && admodel.read != true{
                ad?.read = true
                needupdate = true
            }else if (ad?.title != admodel.title && admodel.read != true ){
                hasNoRead = true
            }
            items.append(ad!)
        })
        if needupdate{
            LocalTools.instance.setValueForKey(key: "ads", value: items.toJSONString())
            LocalTools.instance.setValueForKey(key: "hasNoRead", value: hasNoRead)
            fetchData()
        }
        
        if let msgLink = admodel.msgLink {
            
            if msgLink.contains("active.html") {
                self.navigationController?.popViewController(animated: true)
                UIApplication.shared.open(URL(string: msgLink)!)
            } else {
                let vc = FlySafariVC(url: URL(string: msgLink)!)
                vc.delegate = self
                self.present(vc, animated: true, completion: nil)
            }
            
        }
        
    }
    
    @objc func safariViewControllerDidFinish(_ controller: SFSafariViewController) {
        controller.dismiss(animated: true) {
        }
    }
}
