//
//  MyInvitedVC.swift
//  Telescope
//
//  Created by LEI on 2021/9/29.
//  Copyright © 2021 TouchingApp. All rights reserved.
//

import Foundation
import SnapKit
import UIKit

class MyInvitedVC: UIViewController {
    
    var inviteInfoRecord:InviteInfoRecord? = nil

    override func viewDidLoad() {
        title = "我的成就"
        
        view.addSubview(tableView)
        headerView.addSubview(countTitleLabel)
        headerView.addSubview(countInviteLabel)
        headerView.addSubview(countGetTimeLabel)
        headerView.addSubview(detailLabel)
        headerView.addSubview(lineView)
        setupLayout()
        
        getInvitedRecord()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
//        navigationController?.navigationBar.barTintColor = Color.DefualtColor
        
        let dict:NSDictionary = [NSAttributedString.Key.foregroundColor: Color.DefualtColor ,NSAttributedString.Key.font : UIFont.boldSystemFont(ofSize: 20)]
        //标题颜色
        navigationController?.navigationBar.titleTextAttributes = dict as? [NSAttributedString.Key : AnyObject]
        //item颜色
        navigationController?.navigationBar.tintColor = Color.DefualtColor
    }
    
    
    func setupLayout() {
        
        tableView.snp.makeConstraints { (make) in
            make.top.equalToSuperview()
            make.left.right.bottom.equalToSuperview()
        }
        
        headerView.snp.makeConstraints { make in
            make.top.equalToSuperview()
            make.width.equalToSuperview()
            make.height.equalTo(180)
        }
        
        countTitleLabel.snp.makeConstraints { make in
            make.top.equalToSuperview().offset(20)
            make.left.equalToSuperview().offset(20)
        }
        
        countInviteLabel.snp.makeConstraints { make in
            make.top.equalTo(countTitleLabel.snp.bottom).offset(20)
            make.left.equalTo(countTitleLabel)
        }
        
        countGetTimeLabel.snp.makeConstraints { make in
            make.top.equalTo(countInviteLabel.snp.bottom).offset(10)
            make.left.equalTo(countTitleLabel)

        }
        
        detailLabel.snp.makeConstraints { make in
            make.top.equalTo(countGetTimeLabel.snp.bottom).offset(20)
            make.left.equalTo(countTitleLabel)
        }
        
        lineView.snp.makeConstraints { make in
            make.top.equalTo(detailLabel.snp.bottom).offset(15)
            make.height.equalTo(1)
            make.left.equalTo(countTitleLabel)
            make.right.equalToSuperview().offset(-20)
        }
    }
    
    lazy var tableView: UITableView = {
        let v = UITableView()

        v.dataSource = self
        v.delegate = self
        v.tableFooterView = UIView()
        v.separatorStyle = .none
        v.backgroundColor = .white
        v.tableHeaderView = headerView

        return v
    }()
    
    
    func getInvitedRecord() {
        self.showProgreeHUD()
        ShadowApiService.instance.GetInviteInfo(onSuccess:{ result in
            self.hideHUD()
            if(result.code == HttpResult.HTTP_OK){
                
                if(result.data != nil){
                    self.inviteInfoRecord = result.data!
                    
                    self.countInviteLabel.text  = "总邀请人数：\(self.inviteInfoRecord?.totalNum ?? 0) 人"
                    self.countGetTimeLabel.text = "总获取时长：\(self.inviteInfoRecord?.totalGetTime ?? 0) 分钟"
                }
                
                self.tableView.reloadData()
            } else {
                self.showTextHUD(result.message ?? "获取邀请记录失败", dismissAfterDelay: 1.5)
            }
         
          
          
        },onFail: { error in
            self.showTextHUD("获取邀请记录失败", dismissAfterDelay: 1.5)
          
        },token: AppData.authUser?.token)
    }
    
    lazy var headerView: UIView = {
        let v = UIView()
        return v
    }()
    
    lazy var countTitleLabel: UILabel = {
        let v = UILabel()
        v.textColor = .black
        v.font = UIFont.boldSystemFont(ofSize: 20)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        v.text = "累计获赠"
        return v
    }()
    
    lazy var countInviteLabel: UILabel = {
        let v = UILabel()
        v.textColor = .black
        v.font = UIFont.systemFont(ofSize: 16)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        return v
    }()
    
    lazy var countGetTimeLabel: UILabel = {
        let v = UILabel()
        v.textColor = .black
        v.font = UIFont.systemFont(ofSize: 16)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        return v
    }()
    
    lazy var detailLabel: UILabel = {
        let v = UILabel()
        v.textColor = .black
        v.font = UIFont.boldSystemFont(ofSize: 20)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        v.text = "明细记录"
        return v
    }()
    
    lazy var lineView: UIView = {
        let v = UIView()
        v.backgroundColor = "d6d6d6".color
        return v
    }()
}


extension MyInvitedVC: UITableViewDelegate, UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {

        return inviteInfoRecord?.invite?.count ?? 0
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        
        if let inviteArray = inviteInfoRecord?.invite {
            let model = inviteArray[indexPath.row]
            let cell = ActiveRecordCell(style: .default, reuseIdentifier: "ActiveRecordCell") as ActiveRecordCell
            cell.selectionStyle = .none
            // RecordModel
            cell.messageTitle.text = "奖励时长:\(model.getTime ?? 0)分钟"
            cell.messageText.text = model.create_time
            return cell
        } else {
            return UITableViewCell()
        }
        
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        if inviteInfoRecord?.invite?.count ?? 0 > 0 {
            return 66
        }
        return 300
    }
    
}
  
