//
//  RechargeRecordViewController.swift
//  Telescope
//
//  Created by shadow on 2022/5/18.
//  Copyright © 2022 TouchingApp. All rights reserved.
//

import SnapKit

class RechargeRecordViewController: UIViewController {
    
    var dataArray : Array<Order> = []

    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = "充值记录"
        
        view.addSubview(tableView)
        setupLayout()
        
        getRechargeRecord()
        
    }
    
    func setupLayout() {
        
        tableView.snp.makeConstraints { (make) in
            make.top.equalToSuperview()
            make.left.right.bottom.equalToSuperview()
        }
    }
    
    lazy var tableView: UITableView = {
        let v = UITableView()

        v.dataSource = self
        v.delegate = self
        v.tableFooterView = UIView()
        v.tableHeaderView = UIView()
        v.separatorStyle = .none
        v.backgroundColor = .white

        return v
    }()
    
    
    func getRechargeRecord() {
        self.showProgreeHUD()
        let model = PageModel()
        ShadowApiService.instance.getRechargeRecords(model: model, onSuccess: { result in
            self.hideHUD()
            if(result.code == HttpResult.HTTP_OK){
                self.dataArray.removeAll()
                
                if(result.data != nil && result.data?.data != nil ) {
                    self.dataArray.append(contentsOf:result.data?.data! ?? [])
                }
                
                self.tableView.reloadData()
            } else {
                self.showTextHUD(result.message ?? "获取充值记录失败", dismissAfterDelay: 1.5)
            }
         
        }, onFail: { error in
            self.showTextHUD("获取充值记录失败", dismissAfterDelay: 1.5)

        }, token:  AppData.authUser?.token)
        
        
//        ShadowApiService.instance.getRechargeRecords(model: model)(onSuccess:{ result in
//
//
//
//        },onFail: { error in
//
//        },token: AppData.authUser?.token)
    }
}


extension RechargeRecordViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {

        return dataArray.count //接口数据数量
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if dataArray.count == 0 {
            return UITableViewCell()
        }
        
        let model = dataArray[indexPath.row]
        let cell = RechargeRecordCell(style: .default, reuseIdentifier: "RechargeRecordCell") as RechargeRecordCell
        cell.selectionStyle = .none
        // RecordModel
        cell.model = model
        return cell
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        if dataArray.count > 0 {
            return 66
        }
        return 300
    }
    
 
}
