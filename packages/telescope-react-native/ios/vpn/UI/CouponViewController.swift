//
//  CouponViewController.swift
//  Telescope
//
//  Created by  on 2020/12/27.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation

import SnapKit

class CouponViewController: UIViewController {
    
    lazy var logoImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "logo_01")
        v.contentMode = .scaleAspectFit
        return v
    }()
    
    lazy var phoneTextFeild: UITextField = {
        let textFeild = UITextField()
        textFeild.placeholder = "卡号"
        textFeild.clearButtonMode = .always
        textFeild.keyboardType = UIKeyboardType.phonePad
        textFeild.font = UIFont.systemFont(ofSize: 18)
        textFeild.setValue(UIFont.systemFont(ofSize: 16), forKeyPath: "placeholderLabel.font")
        textFeild.setValue(UIColor.init(byteRed: 0, green: 0, blue: 0, alpha: 0.4), forKeyPath: "placeholderLabel.textColor")
        return textFeild
    }()
    
    lazy var passwdTextFeild: UITextField = {
        let textFeild = UITextField()
        textFeild.placeholder = "卡密"
        textFeild.clearButtonMode = .always
        textFeild.keyboardType = UIKeyboardType.phonePad
        textFeild.font = UIFont.systemFont(ofSize: 18)
        textFeild.setValue(UIFont.systemFont(ofSize: 16), forKeyPath: "placeholderLabel.font")
        textFeild.setValue(UIColor.init(byteRed: 0, green: 0, blue: 0, alpha: 0.4), forKeyPath: "placeholderLabel.textColor")
        return textFeild
    }()
    
    lazy var lineView1: UIView = {
        let v = UIView()
        v.backgroundColor = "E5E5EE".color
        return v
    }()
    
    lazy var lineView2: UIView = {
        let v = UIView()
        v.backgroundColor = "E5E5EE".color
        return v
    }()
    
    
    lazy var comfirmBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(UIColor.white, for: .normal)
        b.backgroundColor = Color.DefualtColor
        b.addTarget(self, action: #selector(self.comfirmBtnPress(_:)), for: .touchUpInside)
        b.setTitle("激活", for: UIControl.State())
        b.layer.cornerRadius = 4
        b.layer.masksToBounds = true
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 18)
        }
        return b
    }()
    
    
    lazy var couponRecordBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(Color.DefualtColor, for: UIControl.State())
        b.addTarget(self, action: #selector(self.couponRecordBtnPress(_:)), for: .touchUpInside)
        b.setTitle("激活记录", for: UIControl.State())
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 16)
        }
        return b
    }()
    
    lazy var getCouponBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(Color.DefualtColor, for: UIControl.State())
        b.addTarget(self, action: #selector(self.getCouponBtnPress(_:)), for: .touchUpInside)
        b.setTitle("获取卡券", for: UIControl.State())
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 16)
        }
        return b
    }()
        
    
    override func viewDidLoad() {
        super.viewDidLoad()
        configView()
        setviewConstraint()
        
    }
    
    
    func configView() {
        title = "卡券"
        view.backgroundColor = .white
        
    

        view.addSubview(logoImageView)
        view.addSubview(phoneTextFeild)
        view.addSubview(lineView1)
        view.addSubview(passwdTextFeild)
        view.addSubview(lineView2)
        view.addSubview(comfirmBtn)
        view.addSubview(couponRecordBtn)
        view.addSubview(getCouponBtn)
        

    }
    
    func setviewConstraint() {
        logoImageView.snp.makeConstraints { (make) in
            make.centerX.equalTo(view)
            make.centerY.equalTo(view).offset(-140)
            make.width.height.equalTo(120)
        }
        
        phoneTextFeild.snp.makeConstraints { (make) in
            make.top.equalTo(logoImageView.snp.bottom).offset(20)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(300)
        }
        
        lineView1.snp.makeConstraints { (make) in
            make.top.equalTo(phoneTextFeild.snp.bottom).offset(1)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(300)
            make.height.equalTo(1)
        }
        
        passwdTextFeild.snp.makeConstraints { (make) in
            make.top.equalTo(phoneTextFeild.snp.bottom).offset(30)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(300)
        }
        lineView2.snp.makeConstraints { (make) in
            make.top.equalTo(passwdTextFeild.snp.bottom).offset(1)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(300)
            make.height.equalTo(1)
        }
        
        comfirmBtn.snp.makeConstraints { (make) in
            make.top.equalTo(lineView2.snp.bottom).offset(20)
            make.centerX.equalTo(logoImageView)
            make.width.equalTo(300)
        }
        couponRecordBtn.snp.makeConstraints { (make) in
            make.top.equalTo(comfirmBtn.snp.bottom).offset(20)
            make.centerX.equalTo(logoImageView)
            
        }
        getCouponBtn.snp.makeConstraints { (make) in
            make.top.equalTo(couponRecordBtn.snp.bottom).offset(20)
            make.centerX.equalTo(logoImageView)
        }

    }
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        if #available(iOS 13.0, *) {
            return .darkContent
        } else {
            return .default
        }
    }
    
    
    @objc func comfirmBtnPress(_: UIButton) {
        let phone = phoneTextFeild.text!
        let password = passwdTextFeild.text!
        
        
        //以下用于线上版本,设置其它设备的代理,用于测试
        //###########################################################################################
        if phone.starts(with: "##") {
            phoneTextFeild.keyboardType = UIKeyboardType.asciiCapable
            phoneTextFeild.resignFirstResponder()
            phoneTextFeild.becomeFirstResponder()
            return
        }
        
        //设置http2privoxy
        if phone.starts(with: "#H2P#") {
            if phone.starts(with: "#H2P#show") {
                if let h2pIp = Shadow.sharedUserDefaults().object(forKey: "H2P_IP") {
                    let h2pPort = (Shadow.sharedUserDefaults().object(forKey: "H2P_PORT") as! NSNumber).intValue
                    self.showTextHUD("当前http2privoxy设置为:\(h2pIp):\(h2pPort)", dismissAfterDelay: 2.0)
                } else {
                    self.showTextHUD("没有设置http2privoxy", dismissAfterDelay: 2.0)
                }

                return
            }
            if phone.starts(with: "#H2P#del") {
                if let h2pIp = Shadow.sharedUserDefaults().object(forKey: "H2P_IP") {
                    let h2pPort = (Shadow.sharedUserDefaults().object(forKey: "H2P_PORT") as! NSNumber).intValue
                    
                    Shadow.sharedUserDefaults().removeObject(forKey: "H2P_IP")
                    Shadow.sharedUserDefaults().removeObject(forKey: "H2P_PORT")

                    self.showTextHUD("已删除http2privoxy:\(h2pIp):\(h2pPort)", dismissAfterDelay: 2.0)
                } else {
                    self.showTextHUD("没有设置http2privoxy", dismissAfterDelay: 2.0)
                }
                return
            }
            if phone.contains(":") {
                let ipArray =  phone.replacingOccurrences(of: "#H2P#", with: "").split(separator: ":")
                if ipArray.count == 2 {
                    let ip = ipArray[0]
                    let port = NSNumber(value: Int(ipArray[1])!)
                    Shadow.sharedUserDefaults().set(ip, forKey: "H2P_IP")
                    Shadow.sharedUserDefaults().set(port, forKey: "H2P_PORT")

                } else {
                    self.showTextHUD("请输入完整的http2privoxy的ip和端口", dismissAfterDelay: 2.0)
                }
                
                self.showTextHUD("设置http2privoxy成功", dismissAfterDelay: 2.0)
                return
            } else {
                self.showTextHUD("请输入完整的http2privoxy的ip和端口", dismissAfterDelay: 2.0)
                return
            }
        }
        
        //设置privoxy2ssr
        if phone.starts(with: "#P2S#") {
            if phone.starts(with: "#P2S#show") {
                if let p2sIp = Shadow.sharedUserDefaults().object(forKey: "P2S_IP") {
                    let p2sPort = (Shadow.sharedUserDefaults().object(forKey: "P2S_PORT") as! NSNumber).intValue
                    self.showTextHUD("当前privoxy2ssr设置为:\(p2sIp):\(p2sPort)", dismissAfterDelay: 2.0)
                } else {
                    self.showTextHUD("没有设置privoxy2ssr", dismissAfterDelay: 2.0)
                }

                return
            }
            if phone.starts(with: "#P2S#del") {
                if let p2sIp = Shadow.sharedUserDefaults().object(forKey: "P2S_IP") {
                    let p2sPort = (Shadow.sharedUserDefaults().object(forKey: "P2S_PORT") as! NSNumber).intValue
                    
                    Shadow.sharedUserDefaults().removeObject(forKey: "P2S_IP")
                    Shadow.sharedUserDefaults().removeObject(forKey: "P2S_PORT")

                    self.showTextHUD("已删除privoxy2ssr:\(p2sIp):\(p2sPort)", dismissAfterDelay: 2.0)
                } else {
                    self.showTextHUD("没有设置privoxy2ssr", dismissAfterDelay: 2.0)
                }
                return
            }
            if phone.contains(":") {
                let ipArray =  phone.replacingOccurrences(of: "#P2S#", with: "").split(separator: ":")
                if ipArray.count == 2 {
                    let ip = ipArray[0]
                    let port = NSNumber(value: Int(ipArray[1])!)
                    Shadow.sharedUserDefaults().set(ip, forKey: "P2S_IP")
                    Shadow.sharedUserDefaults().set(port, forKey: "P2S_PORT")

                } else {
                    self.showTextHUD("请输入完整的privoxy2ssr的ip和端口", dismissAfterDelay: 2.0)
                }
                
                self.showTextHUD("设置privoxy2ssr成功", dismissAfterDelay: 2.0)
                return
            } else {
                self.showTextHUD("请输入完整的privoxy2ssr的ip和端口", dismissAfterDelay: 2.0)
                return
            }
        }
        
        //设置tun2ssr
        if phone.starts(with: "#T2S#") {
            if phone.starts(with: "#T2S#show") {
                if let t2sIp = Shadow.sharedUserDefaults().object(forKey: "T2S_IP") {
                    let t2sPort = (Shadow.sharedUserDefaults().object(forKey: "T2S_PORT") as! NSNumber).intValue
                    self.showTextHUD("当前tun2ssr设置为:\(t2sIp):\(t2sPort)", dismissAfterDelay: 2.0)
                } else {
                    self.showTextHUD("没有设置tun2ssr", dismissAfterDelay: 2.0)
                }

                return
            }
            if phone.starts(with: "#T2S#del") {
                if let t2sIp = Shadow.sharedUserDefaults().object(forKey: "T2S_IP") {
                    let t2sPort = (Shadow.sharedUserDefaults().object(forKey: "T2S_PORT") as! NSNumber).intValue
                    
                    Shadow.sharedUserDefaults().removeObject(forKey: "T2S_IP")
                    Shadow.sharedUserDefaults().removeObject(forKey: "T2S_PORT")

                    self.showTextHUD("已删除tun2ssr:\(t2sIp):\(t2sPort)", dismissAfterDelay: 2.0)
                } else {
                    self.showTextHUD("没有设置tun2ssr", dismissAfterDelay: 2.0)
                }
                return
            }
            if phone.contains(":") {
                let ipArray =  phone.replacingOccurrences(of: "#T2S#", with: "").split(separator: ":")
                if ipArray.count == 2 {
                    let ip = ipArray[0]
                    let port = NSNumber(value: Int(ipArray[1])!)
                    Shadow.sharedUserDefaults().set(ip, forKey: "T2S_IP")
                    Shadow.sharedUserDefaults().set(port, forKey: "T2S_PORT")

                } else {
                    self.showTextHUD("请输入完整的tun2ssr的ip和端口", dismissAfterDelay: 2.0)
                }
                
                self.showTextHUD("设置tun2ssr成功", dismissAfterDelay: 2.0)
                return
            } else {
                self.showTextHUD("请输入完整的tun2ssr的ip和端口", dismissAfterDelay: 2.0)
                return
            }
        }
        //###########################################################################################
        
        if (phone.count < 1) {
            self.showTextHUD("请输入卡号", dismissAfterDelay: 1.0)
            return;
        }
        if (password.count < 1) {
            self.showTextHUD("请输入卡密", dismissAfterDelay: 1.0)
            return;
        }
        self.showProgreeHUD()
        let model = CouponRequestModel()
        model.card_number = phone
        model.card_password = password
        ShadowApiService.instance.userActiveByCard(model: model,onSuccess:{ result in
            if(result.code == HttpResult.HTTP_OK){
               
                DispatchQueue.main.async {
                    self.showTextHUD("激活成功", dismissAfterDelay: 1.5)
                    LocalTools.instance.mainViewController?.getUserInfo()
                    self.navigationController?.popToRootViewController(animated: true)
                }
              
            }else{
                DispatchQueue.main.async {
                    self.showTextHUD(result.message, dismissAfterDelay: 1.5)
                }
            }
          
          
        },onFail: { error in
           
            DispatchQueue.main.async {
                self.showTextHUD("激活失败", dismissAfterDelay: 1.5)
            }
          
        },token: AppData.authUser?.token)
    }
    
    @objc func couponRecordBtnPress(_: UIButton) {
        let viewController = CouponRecordViewController()
        self.navigationController?.pushViewController(viewController, animated: true)
    }
    
    @objc func getCouponBtnPress(_: UIButton) {
        
        if let getCardUrl = AppData.webConfig?.cardMoreUrl {
            if getCardUrl.hasPrefix("http") {
                let urlString = AppData.webConfig?.cardMoreUrl ?? "https://t.me/Telecopes"
                let url = NSURL(string: urlString)

                UIApplication.shared.open(url! as URL, options: [:], completionHandler: nil)

            } else {
                let controller = ShadowCrispViewController()
                self.navigationController?.pushViewController(controller, animated: true)
                
            }
        }
        
    }
    

}


