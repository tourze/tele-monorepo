//
//  ShareViewController.swift
//  Telescope
//
//  Created by  on 2020/12/27.
//  Copyright © 2020 TouchingApp. All rights reserved.
//

import Foundation

import SnapKit
import UIKit
import EFQRCode

class ShareViewController: UIViewController {
    
    override func viewDidLoad() {
        title = "分享"
        
        view.addSubview(bgImageView)
        view.addSubview(qrcodeBgView)
        qrcodeBgView.addSubview(titleLabel)
        qrcodeBgView.addSubview(inviteCodeLabel)
        qrcodeBgView.addSubview(qrcodeImageView)
        qrcodeBgView.addSubview(bindInviteBtn)
        qrcodeBgView.addSubview(detailLabel)
        view.addSubview(myInviteBtn)
        view.backgroundColor = "108EE9".color
        
        
        let inviteCodeLabelTap = UITapGestureRecognizer.init(target: self, action: #selector(inviteCodeLabelAction))
        inviteCodeLabel.addGestureRecognizer(inviteCodeLabelTap)
        inviteCodeLabel.isUserInteractionEnabled = true
        
        setupLayout()
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        let dict:NSDictionary = [NSAttributedString.Key.foregroundColor: UIColor.white ,NSAttributedString.Key.font : UIFont.boldSystemFont(ofSize: 20)]
        //标题颜色
        navigationController?.navigationBar.titleTextAttributes = dict as? [NSAttributedString.Key : AnyObject]
        //item颜色
        navigationController?.navigationBar.tintColor = .white
        
    }
    
    // MARK: layout
    
    func setupLayout() {
        bgImageView.snp.makeConstraints { make in
            make.top.equalToSuperview().offset(-50)
            make.size.equalToSuperview()
            make.bottom.equalToSuperview().offset(-50)
        }
        
        qrcodeBgView.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.centerY.equalToSuperview().offset(30)
            make.size.equalTo(CGSize(width: 280, height: 340))
        }
        
        titleLabel.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalToSuperview().offset(15)
        }
        
        inviteCodeLabel.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalTo(titleLabel.snp.bottom).offset(8)
        }
        
        qrcodeImageView.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalTo(inviteCodeLabel.snp.bottom).offset(10)
            make.size.equalTo(CGSize(width: 180, height: 180))
        }
        
        bindInviteBtn.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalTo(qrcodeImageView.snp.bottom).offset(8)
        }
        
        detailLabel.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalTo(bindInviteBtn.snp.bottom).offset(8)
            make.left.equalToSuperview().offset(20)
            make.right.equalToSuperview().offset(-20)
            make.bottom.equalToSuperview().offset(-5)
        }
        
        myInviteBtn.snp.makeConstraints { make in
            make.centerX.equalToSuperview()
            make.top.equalTo(qrcodeBgView.snp.bottom).offset(30)
            make.width.equalTo(88)
        }
    }
    
    // MARK: lazy UI
    lazy var bgImageView: UIImageView = {
        let v = UIImageView()
        v.image = UIImage(named: "img_bg_share")
        v.contentMode = .scaleAspectFit
        return v
    }()
    
    lazy var qrcodeBgView: UIView = {
        let v = UIView()
        v.backgroundColor = .white
        v.layer.cornerRadius = 5
        v.layer.masksToBounds = true
        return v
    }()
    
    lazy var titleLabel: UILabel = {
        let v = UILabel()
        v.textColor = .gray
        v.font = UIFont.systemFont(ofSize: 16)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        v.text = "你的专属邀请码"
        return v
    }()
    
    lazy var inviteCodeLabel: UILabel = {
        let v = UILabel()
        v.textColor = .black
        v.font = UIFont.boldSystemFont(ofSize: 20)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        v.text = AppData.authUser?.inviteCode
        return v
    }()
    
    lazy var qrcodeImageView: UIImageView = {
        let v = UIImageView()
        
        if(AppData.loggedUser != nil){
            if let tryImage = EFQRCode.generate(content: AppData.loggedUser!.inviteUrl){
                v.image = UIImage.init(cgImage: tryImage)
            }
        }
        v.contentMode = .scaleAspectFit
        return v
    }()
    
    lazy var bindInviteBtn: UIButton = {
        let b = UIButton(type: .custom)
        
        b.addTarget(self, action: #selector(self.bindInvitePress(_:)), for: .touchUpInside)
        
        let str = AppData.loggedUser?.inviteBy ?? ""
        if(!str.isEmpty){
            b.setTitle("已绑定邀请人：\(str)", for: UIControl.State())
            b.setTitleColor(.black, for: .normal)
            b.setTitleColor(.black, for: .highlighted)
        } else {
            b.setTitle("绑定邀请人", for: UIControl.State())
            b.setTitleColor(Color.DefualtColor, for: .normal)
            b.setTitleColor(.lightGray, for: .highlighted)
        }
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 16)
        }
        return b
    }()
    
    lazy var detailLabel: UILabel = {
        let v = UILabel()
        v.textColor = Color.DefualtColor
        v.font = UIFont.systemFont(ofSize: 13)
        v.adjustsFontSizeToFitWidth = true
        v.minimumScaleFactor = 0.8
        v.numberOfLines = 0
        if let webConfig = AppData.webConfig {
            v.text = "邀请一个好友使用，即可获得\(webConfig.inviteAddTime)和\(webConfig.inviteAddFlow)高速无限流量体验，多邀请多赠送喔！"
        } else {
            v.text = "邀请一个好友使用，即可获得高速无限流量体验，多邀请多赠送喔！"
        }
        return v
    }()
    
    lazy var myInviteBtn: UIButton = {
        let b = UIButton(type: .custom)
        b.setTitleColor(Color.DefualtColor, for: .normal)
        b.setTitleColor(.lightGray, for: .highlighted)
        b.backgroundColor = .white

        b.addTarget(self, action: #selector(self.myInviteBtnPress(_:)), for: .touchUpInside)
        b.setTitle("我的成就", for: UIControl.State())
        b.layer.cornerRadius = 8
        b.layer.masksToBounds = true
        if let titleLabel = b.titleLabel {
            titleLabel.font = UIFont.systemFont(ofSize: 16)
        }
        return b
    }()
    
    @objc func bindInvitePress(_: UIButton) {
        let str = AppData.loggedUser?.inviteBy ?? ""
        if(!str.isEmpty){
            return
        }
        
        let alertController = UIAlertController(title: "提示", message: "绑定成功后不可修改，请仔细填写", preferredStyle: UIAlertController.Style.alert)
        alertController.addTextField { (textField : UITextField!) -> Void in
            textField.placeholder = "请输入推荐人的邀请码"
        }
        let saveAction = UIAlertAction(title: "Commit".localized(), style: UIAlertAction.Style.default, handler: {  alert -> Void in
            let firstTextField = alertController.textFields![0] as UITextField
            self.commitInviteCode(inviteCode: firstTextField.text!)
        })
        let cancelAction = UIAlertAction(title: "Cancel".localized(), style: UIAlertAction.Style.default, handler: {
            (action : UIAlertAction!) -> Void in })

        alertController.addAction(cancelAction)
        alertController.addAction(saveAction)
        
        self.present(alertController, animated: true, completion: nil)
    }
    
    @objc func myInviteBtnPress(_: UIButton) {
        
        let myInvitedVC  = MyInvitedVC()
        self.navigationController?.pushViewController(myInvitedVC, animated: true)
        
    }
    
    func commitInviteCode(inviteCode: String) {
        if inviteCode.isEmpty {
            self.showTextHUD("邀请码不能为空", dismissAfterDelay: 2) {
                self.bindInvitePress(self.bindInviteBtn)
            }
            return
        }
        
        
        let req = InviteInfoReq()
        req.inviteCode = inviteCode
        
        self.showProgreeHUD()
        ShadowApiService.instance.BindInvite(inviteReq: req,onSuccess: {
            result in
            if(result.code == HttpResult.HTTP_OK ){
                self.showTextHUD(result.message ?? "绑定成功", dismissAfterDelay: 2)
                self.bindInviteBtn.setTitle("已绑定邀请人：\(inviteCode)", for: UIControl.State())
                self.bindInviteBtn.setTitleColor(.black, for: .normal)
                self.bindInviteBtn.setTitleColor(.black, for: .highlighted)

            }else{
                self.showTextHUD(result.message ?? "绑定失败", dismissAfterDelay: 2)
            }
            
        },token:AppData.authUser?.token )
    }
    
    
    @objc func inviteCodeLabelAction() {
        
        if let authUser = AppData.authUser {
            let inviteCode = authUser.inviteCode
            self.showTextHUD("[\(inviteCode)]邀请码已复制", dismissAfterDelay: 2)
            UIPasteboard.general.string = inviteCode
        }

    }
    
}
