//
//  MenuView.swift

//
//  Created by  on 2020/10/29.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation

import SnapKit

protocol MenuViewDelegate: AnyObject {
    func didSelectRow(index: Int)
    func didHideMenuView()
    func didBindBtnClick()
}


class MenuView: UIView {

    weak var delegate: MenuViewDelegate?
    
    
    let bgView = UIView()
    
    let tapView = UIView()
    
    let tableView = UITableView()
    
    let infobgView = UIView()
    let infoLable = UILabel()
    
    

    
    var dataArray = Array<CommonProblemModel>()
    
    override init(frame: CGRect) {
        super.init(frame: CGRect.zero)
        
        setViewConstraint()
        dealData()
        
    }
    
    
    
    lazy var bindBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(.white, for: .normal)
        b.setTitleColor(.lightGray, for: .highlighted)
        b.backgroundColor = Color.DefualtColor
        b.addTarget(self, action: #selector(self.bindBtnPress(_:)), for: .touchUpInside)
        b.setTitle("登录", for: UIControl.State())
        b.layer.cornerRadius = 8
        b.layer.masksToBounds = true
        b.isHidden = true
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 13)
        }
        return b
    }()
    
    @objc func bindBtnPress(_: UIButton) {
        
        delegate?.didBindBtnClick()
    }
    
    func setViewConstraint() {

        self.backgroundColor = UIColor.black.withAlphaComponent(0.3)
        
        bgView.backgroundColor = .white
        self.addSubview(bgView)
        
        self.addSubview(tapView)
        
        infobgView.backgroundColor = Color.MainBackgroudColor
        
       bgView.addSubview(infobgView)
        
        infobgView.addSubview(infoLable)
              
       infoLable.font = UIFont(name: "PingFangSC-Regular", size: 12)
       infoLable.textColor = Color.DefualtColor
       infoLable.text = ""
       infoLable.numberOfLines = 5
        infoLable.backgroundColor =  .clear
        
        infobgView.addSubview(bindBtn)
        
        tableView.delegate = self
        tableView.dataSource = self
        tableView.tableFooterView = UIView()
        tableView.separatorStyle = .none
       // tableView.backgroundColor = .clear
        bgView.addSubview(tableView)
        
 
        tapView.isUserInteractionEnabled = true
        let tap = UITapGestureRecognizer(target: self, action: #selector(tapAction))
        tapView.addGestureRecognizer(tap)
        
        bgView.snp.makeConstraints { (make) in
            
            make.top.bottom.equalTo(self)
            make.left.equalTo(self).offset(-280)
            make.width.equalTo(280)
        }
        
        
        tapView.snp.makeConstraints { (make) in
            make.right.top.bottom.equalTo(self)
            make.left.equalTo(self).offset(280)
        }
    
        infobgView.snp.makeConstraints { (make) in
            
            make.right.top.equalTo(bgView)
            make.left.equalTo(bgView)
            make.height.equalTo(120)
        }
        
        infoLable.snp.makeConstraints { (make) in
            
            make.right.top.bottom.equalTo(infobgView)
            make.left.equalTo(bgView).offset(20)
            
        }
        
        bindBtn.snp.makeConstraints { (make) in
            make.right.equalToSuperview().offset(-20)
            make.top.equalToSuperview().offset(27)
            make.width.equalTo(70)
        }
        
        tableView.snp.makeConstraints { (make) in
            
            make.left.right.bottom.equalTo(bgView)
            make.top.equalTo(bgView).offset(120)
        }
    }
    
    
    func dealData() {
        dataArray.removeAll()
        let array: Array<Dictionary<String,String>> = [

            ["icon_url":"buycard", "title": "充值" ],
            ["icon_url":"icon_meau_feekback", "title": "在线客服" ],
            ["icon_url":"icon_advanced", "title": "代理模式" ],
            ["icon_url":"icon_menu_rate", "title": "在App Store评价" ],
            ["icon_url":"icon_meau_about", "title": "关于我们" ],

            ]
        for dic in array {
            if let model = CommonProblemModel(dic: dic) {
                dataArray.append(model)
            }
        }
        tableView.reloadData()
    }
    
    func dealData2() {
        dataArray.removeAll()
        let array: Array<Dictionary<String,String>> = [

            ["icon_url":"icon_meau_qianbao", "title": "卡券" ],
            ["icon_url":"buycard", "title": "充值" ],
            ["icon_url":"icon_scan", "title": "扫一扫" ],
            ["icon_url":"icon_menu_problem", "title": "帮助中心" ],
            ["icon_url":"icon_meau_feekback", "title": "在线客服" ],
            ["icon_url":"icon_advanced", "title": "代理模式" ],
            ["icon_url":"icon_menu_rate", "title": "在App Store评价" ],
            ["icon_url":"icon_meau_about", "title": "关于我们" ],
//            ["icon_url":"icon_meau_about", "title": "privoxyLog" ],
//            ["icon_url":"icon_meau_about", "title": "ssrLog" ],
//            ["icon_url":"icon_meau_about", "title": "gostLog" ],

            ]
        for dic in array {
            if let model = CommonProblemModel(dic: dic) {
                dataArray.append(model)
            }
        }
        tableView.reloadData()
    }
    
    @objc func tapAction() {
        delegate?.didHideMenuView()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
}

extension MenuView: UITableViewDelegate, UITableViewDataSource {
    func numberOfSections(in tableView: UITableView) -> Int {
        return 1
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return dataArray.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        var cell = tableView.dequeueReusableCell(withIdentifier: "commonProblemCell")
        if cell == nil {
            cell = UITableViewCell(style: .default, reuseIdentifier: "commonProblemCell")
        }
        cell?.textLabel?.font = UIFont(name: "PingFangSC-Regular", size: 14)
        cell?.textLabel?.textColor = UIColor(red: 0, green: 0, blue: 0, alpha: 0.6)
        cell?.backgroundColor = .white
        
        let model = dataArray[indexPath.row]
        cell?.textLabel?.text = model.title
        if model.title == "代理模式" {
            if let proxyMode = Shadow.sharedUserDefaults().string(forKey: "ProxyModeType") {
                if proxyMode == ProxyModeType.Global.desc {
                    cell?.textLabel?.text = model.title! + " (全局)"
                } else {
                    cell?.textLabel?.text = model.title! + " (智能)"
                }
            } else {
                cell?.textLabel?.text = model.title! + " (智能)"
            }
        }
        
        if let url = model.iconUrl {
            cell?.imageView?.image = UIImage(named: url)
        }
        
        return cell!
    }
    
    func tableView(_ tableView: UITableView, heightForRowAt indexPath: IndexPath) -> CGFloat {
        return 48
    }
    
    func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        tableView.deselectRow(at: indexPath, animated: true)
        
        delegate?.didSelectRow(index: indexPath.row)
    }
    
    
    func UpdateUserData(isAutoLoging: Bool)  {
        if(LocalTools.instance.AccountCardActive() || LocalTools.instance.userIsLogOut){
            bindBtn.isHidden = false
            dealData2()
            
           
        }else{
            dealData()
            bindBtn.isHidden = true
//            tableView.snp.updateConstraints { (make) in
//                make.left.right.bottom.equalTo(bgView)
//                make.top.equalTo(bgView)
//            }
        }
        
         var memberDetail = ""
         var loginStatus = ""
         var email = ""
         if AppData.loggedUser != nil {
             var vipType = ""
             let it = AppData.loggedUser!
             if it.vip == 0{
                 vipType = "[普通会员]"
             }else if  it.vip == 1 {
                 vipType = "[高级会员]"
             }
             loginStatus = "\(vipType) ID:\(it.id!)"
             
             
             if(AppData.webConfig?.isRegiest == true) {
                 if(AppData.isTrailUser(user: it)){
                     bindBtn.setTitle("登录", for: .normal)
                 }else{
                     bindBtn.setTitle("登出", for: .normal)
                     email = "\n账号:\(it.username ?? "")"
                 }
             }
             
             if it.status == UserStatus.EXPIRED || it.timeRemaining! <= 0{
                 memberDetail = "有效期至" + it.expiredDate! + "\n你的会员已到期";
             }else{
                 memberDetail = "有效期至" + it.expiredDate! + "\n剩余时间 " + DateUtil.GetTimeStringFromMinute(minute: it.timeRemaining!)
                 
                 let remainTransfer = Float(it.flowRemaining.replacingOccurrences(of: "GB", with: "").replacingOccurrences(of: "KB", with: "").replacingOccurrences(of: "MB", with: "").replacingOccurrences(of: "TB", with: ""))
                 if remainTransfer! <= 0 {
                     memberDetail = memberDetail + " \n无限流量(限速模式)"
                 } else {
                     memberDetail = memberDetail + " \n高速流量 \(it.flowRemaining)"
                 }
             }
 
         }else{
             if AppData.appNeedAccountLogin {
                 loginStatus = "未登录,请先登录"
                 bindBtn.setTitle("登录", for: .normal)
             } else {
                 loginStatus = "未登录,可以点击一键登录"
                 
                 if isAutoLoging {
                     bindBtn.setTitle("登录中...", for: .normal)
                 } else {
                     bindBtn.setTitle("一键登录", for: .normal)
                 }
             }
             
             memberDetail = ""
         }
 
         infoLable.text = "\(loginStatus)\n\(memberDetail)\(email)"
    }
    
}
