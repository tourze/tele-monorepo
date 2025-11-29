//
//  CouponRecordViewController.swift
//  Telescope
//
//  Created by LEI on 2021/6/13.
//  Copyright © 2021 TouchingApp. All rights reserved.
//

import SnapKit

class CouponRecordViewController: UIViewController {
    
    var dataArray : Array<CardActiveRecord> = []

    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = "激活记录"
        
        view.addSubview(tableView)
        setupLayout()
        
        getCouponRecord()
        
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
    
    
    func getCouponRecord() {
        self.showProgreeHUD()
        ShadowApiService.instance.CardActiveRecord(onSuccess:{ result in
            self.hideHUD()
            if(result.code == HttpResult.HTTP_OK){
                self.dataArray.removeAll()
                
                if(result.data != nil){
                    self.dataArray.append(contentsOf:result.data!)
                }
                
                self.tableView.reloadData()
            } else {
                self.showTextHUD(result.message ?? "获取激活记录失败", dismissAfterDelay: 1.5)
            }
         
          
          
        },onFail: { error in
            self.showTextHUD("获取激活记录失败", dismissAfterDelay: 1.5)
          
        },token: AppData.authUser?.token)
    }
}


extension CouponRecordViewController: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {

        return dataArray.count //接口数据数量
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        if dataArray.count == 0 {
            return UITableViewCell()
        }
        
        let model = dataArray[indexPath.row]
        let cell = ActiveRecordCell(style: .default, reuseIdentifier: "ActiveRecordCell") as ActiveRecordCell
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
